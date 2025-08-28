import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const orderNumber = searchParams.get('orderNumber')

    // Validate required parameters
    if (!restaurantId || !orderNumber) {
      return NextResponse.json(
        { status: 400, message: 'Missing restaurantId or orderNumber' },
        { status: 400 }
      )
    }

    const order = await prisma.orders.findFirst({
      where: {
        restaurant_id: parseInt(restaurantId),
        order_number: parseInt(orderNumber)
      },
      select: {
        id: true,
        order_number: true,
        customer_name: true,
        total_price: true,
        order_time: true,
        status: true,
        comment: true,
        restaurants: {
          select: {
            name: true
          }
        },
        tables: {
          select: {
            table_number: true
          }
        },
        order_details: {
          select: {
            id: true,
            quantity: true,
            dishes: {
              select: {
                dish_name: true,
                base_price: true
              }
            },
            order_detail_customisation_options: {
              select: {
                option_values: {
                  select: {
                    value_name: true,
                    extra_price: true,
                    customisation_options: {
                      select: {
                        option_name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { status: 404, message: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 200,
      message: 'Order retrieved successfully',
      data: order
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}