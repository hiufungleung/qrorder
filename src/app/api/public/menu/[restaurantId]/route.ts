import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  restaurantId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { restaurantId: restaurantIdStr } = await params
    const restaurantId = parseInt(restaurantIdStr)

    // Get restaurant info
    const restaurant = await prisma.restaurants.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        address: true,
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { status: 404, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Get all categories with dishes and their available options
    const categories = await prisma.dish_categories.findMany({
      where: { restaurant_id: restaurantId },
      include: {
        dishes: {
          include: {
            dish_available_options: {
              include: {
                customisation_options: {
                  include: {
                    option_values: {
                      orderBy: {
                        value_name: 'asc'
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            dish_name: 'asc'
          }
        }
      },
      orderBy: {
        category_name: 'asc'
      }
    })

    // Transform data for menu display
    const menuCategories = categories.map(category => ({
      id: category.id,
      category_name: category.category_name,
      dishes: category.dishes.map(dish => ({
        id: dish.id,
        dish_name: dish.dish_name,
        description: dish.description,
        base_price: Number(dish.base_price),
        availableOptions: dish.dish_available_options.map(da => ({
          id: da.customisation_options.id,
          option_name: da.customisation_options.option_name,
          values: da.customisation_options.option_values.map(value => ({
            id: value.id,
            value_name: value.value_name,
            extra_price: Number(value.extra_price)
          }))
        }))
      }))
    }))

    return NextResponse.json({
      status: 200,
      message: 'Menu retrieved successfully',
      data: {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address
        },
        categories: menuCategories
      }
    })
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}