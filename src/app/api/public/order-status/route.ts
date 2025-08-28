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

    const order = await prisma.order.findFirst({
      where: {
        restaurantId: parseInt(restaurantId),
        orderNumber: parseInt(orderNumber)
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalPrice: true,
        orderTime: true,
        status: true,
        comment: true,
        restaurant: {
          select: {
            name: true
          }
        },
        table: {
          select: {
            tableNumber: true
          }
        },
        orderDetails: {
          select: {
            id: true,
            quantity: true,
            dish: {
              select: {
                dishName: true,
                basePrice: true
              }
            },
            orderDetailCustomisationOptions: {
              select: {
                value: {
                  select: {
                    valueName: true,
                    extraPrice: true,
                    option: {
                      select: {
                        optionName: true
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