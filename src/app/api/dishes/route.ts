import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { status: 400, message: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const restaurantIdNum = parseInt(restaurantId)

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantIdNum) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    const dishes = await prisma.dishes.findMany({
      where: {
        dish_categories: {
          restaurant_id: restaurantIdNum
        }
      },
      include: {
        dish_categories: true,
        dish_available_options: {
          include: {
            customisation_options: {
              include: {
                option_values: true
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dishName, description, basePrice, categoryId, availableOptionIds } = body

    // Validate required fields
    if (!dishName || !description || !basePrice || !categoryId) {
      return NextResponse.json(
        { status: 400, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user has access to this category's restaurant
    const category = await prisma.dish_categories.findUnique({
      where: { id: categoryId },
      select: { restaurant_id: true }
    })

    if (!category) {
      return NextResponse.json(
        { status: 404, message: 'Category not found' },
        { status: 404 }
      )
    }

    if (!session.user.isAdmin && session.user.restaurantId !== category.restaurant_id) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    // Create dish with transaction for available options
    const dish = await prisma.$transaction(async (tx) => {
      const newDish = await tx.dishes.create({
        data: {
          dish_name: dishName,
          description,
          base_price: parseFloat(basePrice),
          category_id: categoryId,
        },
      })

      // Add available options if provided
      if (availableOptionIds && availableOptionIds.length > 0) {
        await tx.dish_available_options.createMany({
          data: availableOptionIds.map((optionId: number) => ({
            dish_id: newDish.id,
            option_id: optionId,
          })),
        })
      }

      return newDish
    })

    return NextResponse.json({
      status: 201,
      message: 'Dish created successfully',
      data: dish
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