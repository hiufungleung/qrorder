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

    const categories = await prisma.dish_categories.findMany({
      where: { restaurant_id: restaurantId },
      include: {
        dishes: true,
      },
      orderBy: {
        category_name: 'asc'
      }
    })

    return NextResponse.json({
      status: 200,
      message: 'Categories retrieved successfully',
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
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
    const { categoryName } = body

    if (!categoryName) {
      return NextResponse.json(
        { status: 400, message: 'Category name is required' },
        { status: 400 }
      )
    }

    const category = await prisma.dish_categories.create({
      data: {
        category_name: categoryName,
        restaurant_id: restaurantId,
      },
    })

    return NextResponse.json({
      status: 201,
      message: 'Category created successfully',
      data: category
    })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Category name already exists for this restaurant' },
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
    const { categoryId, categoryName } = body

    if (!categoryId || !categoryName) {
      return NextResponse.json(
        { status: 400, message: 'Category ID and name are required' },
        { status: 400 }
      )
    }

    // Verify category belongs to this restaurant
    const existingCategory = await prisma.dish_categories.findFirst({
      where: { 
        id: parseInt(categoryId),
        restaurant_id: restaurantId
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { status: 404, message: 'Category not found or access denied' },
        { status: 404 }
      )
    }

    const category = await prisma.dish_categories.update({
      where: { id: parseInt(categoryId) },
      data: {
        category_name: categoryName,
      },
    })

    return NextResponse.json({
      status: 200,
      message: 'Category updated successfully',
      data: category
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Category name already exists for this restaurant' },
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
    const categoryId = url.searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { status: 400, message: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Verify category belongs to this restaurant
    const existingCategory = await prisma.dish_categories.findFirst({
      where: { 
        id: parseInt(categoryId),
        restaurant_id: restaurantId
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { status: 404, message: 'Category not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the category - Prisma will automatically set category_id to NULL for associated dishes
    await prisma.dish_categories.delete({
      where: { id: parseInt(categoryId) }
    })

    return NextResponse.json({
      status: 200,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}