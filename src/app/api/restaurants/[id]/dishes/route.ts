import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { id } = await params
    const restaurantId = parseInt(id)

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    const dishes = await prisma.dishes.findMany({
      where: { 
        dish_categories: {
          restaurant_id: restaurantId
        }
      },
      include: {
        dish_categories: {
          select: {
            id: true,
            category_name: true
          }
        },
        dish_available_options: {
          include: {
            customisation_options: {
              select: {
                id: true,
                option_name: true
              }
            }
          }
        }
      },
      orderBy: {
        dish_name: 'asc'
      }
    })

    return NextResponse.json({
      status: 200,
      message: 'Dishes retrieved successfully',
      data: dishes
    })
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { id } = await params
    const restaurantId = parseInt(id)

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { dishName, description, basePrice, categoryId, selectedOptions } = body

    if (!dishName || !description || !basePrice || !categoryId) {
      return NextResponse.json(
        { status: 400, message: 'Dish name, description, base price, and category are required' },
        { status: 400 }
      )
    }

    // Verify category belongs to this restaurant
    const category = await prisma.dish_categories.findFirst({
      where: { 
        id: parseInt(categoryId),
        restaurant_id: restaurantId
      }
    })

    if (!category) {
      return NextResponse.json(
        { status: 400, message: 'Invalid category for this restaurant' },
        { status: 400 }
      )
    }

    // Create dish with available options in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const dish = await tx.dishes.create({
        data: {
          dish_name: dishName,
          description,
          base_price: parseFloat(basePrice),
          category_id: parseInt(categoryId),
        },
      })

      // Add available options if selected
      if (selectedOptions && Array.isArray(selectedOptions) && selectedOptions.length > 0) {
        await Promise.all(
          selectedOptions.map((option_id: number) =>
            tx.dish_available_options.create({
              data: {
                dish_id: dish.id,
                option_id: option_id,
              },
            })
          )
        )
      }

      return dish
    })

    return NextResponse.json({
      status: 201,
      message: 'Dish created successfully',
      data: result
    })
  } catch (error: any) {
    console.error('Error creating dish:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Dish name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { id } = await params
    const restaurantId = parseInt(id)

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { dishId, dishName, description, basePrice, categoryId, selectedOptions } = body

    if (!dishId || !dishName || !description || !basePrice || !categoryId) {
      return NextResponse.json(
        { status: 400, message: 'Dish ID, name, description, base price, and category are required' },
        { status: 400 }
      )
    }

    // Verify category belongs to this restaurant
    const category = await prisma.dish_categories.findFirst({
      where: { 
        id: parseInt(categoryId),
        restaurant_id: restaurantId
      }
    })

    if (!category) {
      return NextResponse.json(
        { status: 400, message: 'Invalid category for this restaurant' },
        { status: 400 }
      )
    }

    // Verify dish exists and belongs to this restaurant (through category)
    const existingDish = await prisma.dishes.findFirst({
      where: { 
        id: parseInt(dishId),
        dish_categories: {
          restaurant_id: restaurantId
        }
      }
    })

    if (!existingDish) {
      return NextResponse.json(
        { status: 404, message: 'Dish not found or access denied' },
        { status: 404 }
      )
    }

    // Update dish with available options in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const dish = await tx.dishes.update({
        where: { id: parseInt(dishId) },
        data: {
          dish_name: dishName,
          description,
          base_price: parseFloat(basePrice),
          category_id: parseInt(categoryId),
        },
      })

      // Remove existing available options
      await tx.dish_available_options.deleteMany({
        where: { dish_id: parseInt(dishId) }
      })

      // Add new available options if selected
      if (selectedOptions && Array.isArray(selectedOptions) && selectedOptions.length > 0) {
        await Promise.all(
          selectedOptions.map((option_id: number) =>
            tx.dish_available_options.create({
              data: {
                dish_id: dish.id,
                option_id: option_id,
              },
            })
          )
        )
      }

      return dish
    })

    return NextResponse.json({
      status: 200,
      message: 'Dish updated successfully',
      data: result
    })
  } catch (error: any) {
    console.error('Error updating dish:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Dish name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { id } = await params
    const restaurantId = parseInt(id)

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const dishId = url.searchParams.get('dishId')

    if (!dishId) {
      return NextResponse.json(
        { status: 400, message: 'Dish ID is required' },
        { status: 400 }
      )
    }

    // Verify dish exists and belongs to this restaurant (through category)
    const existingDish = await prisma.dishes.findFirst({
      where: { 
        id: parseInt(dishId),
        dish_categories: {
          restaurant_id: restaurantId
        }
      }
    })

    if (!existingDish) {
      return NextResponse.json(
        { status: 404, message: 'Dish not found or access denied' },
        { status: 404 }
      )
    }

    // Delete dish and its available options in transaction
    await prisma.$transaction(async (tx) => {
      await tx.dish_available_options.deleteMany({
        where: { dish_id: parseInt(dishId) }
      })
      await tx.dishes.delete({
        where: { id: parseInt(dishId) }
      })
    })

    return NextResponse.json({
      status: 200,
      message: 'Dish deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting dish:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}