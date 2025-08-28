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
        const dish = await prisma.dish.findUnique({
          where: { id: cartItem.dishId },
          select: { basePrice: true }
        })
        
        if (!dish) {
          throw new Error(`Dish with ID ${cartItem.dishId} not found`)
        }

        // Calculate option prices
        let optionPrice = 0
        if (cartItem.selectedValuesId && cartItem.selectedValuesId.length > 0) {
          const optionValues = await prisma.optionValue.findMany({
            where: {
              id: {
                in: cartItem.selectedValuesId
              }
            },
            select: { extraPrice: true }
          })
          
          optionPrice = optionValues.reduce((sum, value) => sum + Number(value.extraPrice), 0)
        }

        const unitPrice = Number(dish.basePrice) + optionPrice
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
      const lastOrder = await tx.order.findFirst({
        where: { restaurantId },
        orderBy: { orderNumber: 'desc' }
      })
      
      const nextOrderNumber = (lastOrder?.orderNumber || 0) + 1

      // Create the order
      const order = await tx.order.create({
        data: {
          restaurantId,
          orderNumber: nextOrderNumber,
          customerName,
          totalPrice,
          tableId,
          comment,
        },
      })

      // Create order details
      for (const dishPrice of dishPrices) {
        const orderDetail = await tx.orderDetail.create({
          data: {
            orderId: order.id,
            dishId: dishPrice.dishId,
            quantity: dishPrice.quantity,
          },
        })

        // Add customisation options if any
        if (dishPrice.selectedValuesId && dishPrice.selectedValuesId.length > 0) {
          await tx.orderDetailCustomisationOption.createMany({
            data: dishPrice.selectedValuesId.map((valueId: number) => ({
              orderDetailId: orderDetail.id,
              valueId,
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
        orderNumber: result.orderNumber,
        restaurantId: result.restaurantId,
        totalPrice: Number(result.totalPrice)
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

    const order = await prisma.order.findFirst({
      where: {
        restaurantId: parseInt(restaurantId),
        orderNumber: parseInt(orderNumber)
      },
      include: {
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
          include: {
            dish: {
              select: {
                dishName: true,
                basePrice: true
              }
            },
            orderDetailCustomisationOptions: {
              include: {
                value: {
                  select: {
                    valueName: true,
                    extraPrice: true
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
        totalPrice: Number(order.totalPrice)
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