import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, tableId, customerName, comment, dishes } = body

    // Validate required fields
    if (!restaurantId || !tableId || !customerName || !dishes || dishes.length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total price server-side for security
    let totalPrice = 0
    
    const dishPrices = await Promise.all(
      dishes.map(async (cartItem: any) => {
        const dish = await prisma.dishes.findUnique({
          where: { id: cartItem.dishId },
          select: { base_price: true }
        })
        
        if (!dish) {
          throw new Error(`Dish with ID ${cartItem.dishId} not found`)
        }

        // Calculate option prices
        let optionPrice = 0
        if (cartItem.selectedValuesId && cartItem.selectedValuesId.length > 0) {
          const optionValues = await prisma.option_values.findMany({
            where: {
              id: {
                in: cartItem.selectedValuesId
              }
            },
            select: { extra_price: true }
          })
          
          optionPrice = optionValues.reduce((sum, value) => sum + Number(value.extra_price), 0)
        }

        const unitPrice = Number(dish.base_price) + optionPrice
        const itemTotal = unitPrice * cartItem.quantity
        totalPrice += itemTotal

        return {
          ...cartItem,
          unitPrice,
          itemTotal
        }
      })
    )

    // Create order with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get next order number for this restaurant
      const lastOrder = await tx.orders.findFirst({
        where: { restaurant_id: restaurantId },
        orderBy: { order_number: 'desc' }
      })
      
      const nextOrderNumber = (lastOrder?.order_number || 0) + 1

      // Create the order
      const order = await tx.orders.create({
        data: {
          restaurant_id: restaurantId,
          order_number: nextOrderNumber,
          customer_name: customerName,
          total_price: totalPrice,
          table_id: tableId,
          comment,
        },
      })

      // Create order details
      for (const dishPrice of dishPrices) {
        const orderDetail = await tx.order_details.create({
          data: {
            order_id: order.id,
            dish_id: dishPrice.dishId,
            quantity: dishPrice.quantity,
          },
        })

        // Add customisation options if any
        if (dishPrice.selectedValuesId && dishPrice.selectedValuesId.length > 0) {
          await tx.order_detail_customisation_options.createMany({
            data: dishPrice.selectedValuesId.map((valueId: number) => ({
              order_detail_id: orderDetail.id,
              value_id: valueId,
            })),
          })
        }
      }

      return order
    })

    return NextResponse.json({
      status: 200,
      message: 'Order created successfully',
      data: {
        orderId: result.id,
        orderNumber: result.order_number,
        restaurantId: result.restaurant_id,
        totalPrice: Number(result.total_price)
      }
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { status: 500, message: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const orderNumber = searchParams.get('orderNumber')

    if (!restaurantId || !orderNumber) {
      return NextResponse.json(
        { status: 400, message: 'Restaurant ID and order number are required' },
        { status: 400 }
      )
    }

    const order = await prisma.orders.findFirst({
      where: {
        restaurant_id: parseInt(restaurantId),
        order_number: parseInt(orderNumber)
      },
      include: {
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
          include: {
            dishes: {
              select: {
                dish_name: true,
                base_price: true
              }
            },
            order_detail_customisation_options: {
              include: {
                option_values: {
                  select: {
                    value_name: true,
                    extra_price: true
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
      data: {
        ...order,
        totalPrice: Number(order.total_price)
      }
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}