import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const restaurantId = parseInt((await params).id)

    // Check if user has access to this restaurant
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      return NextResponse.json(
        { status: 403, message: 'Not authorized' },
        { status: 403 }
      )
    }

    // Fetch all data in a single database query using includes
    const restaurantData = await prisma.restaurants.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        is_admin: true,
        summary: true,
        dish_categories: {
          select: {
            id: true,
            category_name: true,
          },
          orderBy: {
            category_name: 'asc'
          }
        },
        customisation_options: {
          select: {
            id: true,
            option_name: true,
            option_values: {
              select: {
                id: true,
                value_name: true,
                extra_price: true,
              },
              orderBy: {
                value_name: 'asc'
              }
            }
          },
          orderBy: {
            option_name: 'asc'
          }
        },
        tables: {
          select: {
            id: true,
            table_number: true,
            capacity: true,
          },
          orderBy: {
            table_number: 'asc'
          }
        }
      }
    })

    if (!restaurantData) {
      return NextResponse.json(
        { status: 404, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Fetch dishes separately to include category and option information
    const dishes = await prisma.dishes.findMany({
      where: {
        dish_categories: {
          restaurant_id: restaurantId
        }
      },
      select: {
        id: true,
        dish_name: true,
        description: true,
        base_price: true,
        category_id: true,
        dish_categories: {
          select: {
            id: true,
            category_name: true
          }
        },
        dish_available_options: {
          select: {
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

    // Transform database fields to match frontend types
    const transformedCategories = restaurantData.dish_categories.map(cat => ({
      id: cat.id,
      restaurant_id: restaurantData.id,
      category_name: cat.category_name
    }))

    const transformedOptions = restaurantData.customisation_options.map(opt => ({
      id: opt.id,
      option_name: opt.option_name,
      restaurant_id: restaurantData.id,
      optionValues: opt.option_values?.map(val => ({
        id: val.id,
        option_id: opt.id,
        value_name: val.value_name,
        extra_price: val.extra_price
      })) || []
    }))

    const transformedDishes = dishes.map(dish => ({
      id: dish.id,
      category_id: dish.category_id,
      dish_name: dish.dish_name,
      description: dish.description,
      base_price: dish.base_price,
      category: dish.dish_categories ? {
        id: dish.dish_categories.id,
        restaurant_id: restaurantData.id,
        category_name: dish.dish_categories.category_name
      } : undefined,
      availableOptions: dish.dish_available_options?.map(dao => ({
        dish_id: dish.id,
        option_id: dao.customisation_options.id,
        option: {
          id: dao.customisation_options.id,
          option_name: dao.customisation_options.option_name,
          restaurant_id: restaurantData.id
        }
      })) || []
    }))

    const transformedTables = restaurantData.tables.map(table => ({
      id: table.id,
      restaurant_id: restaurantData.id,
      table_number: table.table_number,
      capacity: table.capacity
    }))

    return NextResponse.json({
      status: 200,
      message: 'Dashboard data fetched successfully',
      data: {
        restaurant: {
          id: restaurantData.id,
          name: restaurantData.name,
          email: restaurantData.email,
          phone: restaurantData.phone,
          address: restaurantData.address,
          isAdmin: restaurantData.is_admin,
          summary: restaurantData.summary
        },
        categories: transformedCategories,
        customisationOptions: transformedOptions,
        dishes: transformedDishes,
        tables: transformedTables
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}