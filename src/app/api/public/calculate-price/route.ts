import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dishes } = body

    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Dishes array is required' },
        { status: 400 }
      )
    }

    let totalPrice = 0
    const calculatedDishes = []

    for (const cartItem of dishes) {
      // Get dish base price
      const dish = await prisma.dish.findUnique({
        where: { id: cartItem.dishId || cartItem.DishID },
        select: { basePrice: true, dishName: true }
      })

      if (!dish) {
        return NextResponse.json(
          { status: 404, message: `Dish with ID ${cartItem.dishId || cartItem.DishID} not found` },
          { status: 404 }
        )
      }

      let unitPrice = Number(dish.basePrice)

      // Add customization option prices
      const selectedValuesId = cartItem.selectedValuesId || cartItem.SelectedValuesID || []
      if (selectedValuesId.length > 0) {
        const optionValues = await prisma.optionValue.findMany({
          where: {
            id: { in: selectedValuesId }
          },
          select: { extraPrice: true }
        })

        const optionsPrice = optionValues.reduce((sum, value) => sum + Number(value.extraPrice), 0)
        unitPrice += optionsPrice
      }

      const quantity = cartItem.quantity || cartItem.Quantity || 1
      const itemTotal = unitPrice * quantity
      totalPrice += itemTotal

      calculatedDishes.push({
        DishID: cartItem.dishId || cartItem.DishID,
        DishName: dish.dishName,
        Quantity: quantity,
        UnitPrice: unitPrice,
        ItemTotal: itemTotal,
        SelectedValuesID: selectedValuesId,
      })
    }

    return NextResponse.json({
      status: 200,
      message: 'Price calculated successfully',
      data: {
        TotalPrice: totalPrice,
        Dishes: calculatedDishes,
      }
    })
  } catch (error) {
    console.error('Error calculating price:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}