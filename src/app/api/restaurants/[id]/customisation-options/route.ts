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

    const customisationOptions = await prisma.customisation_options.findMany({
      where: { restaurant_id: restaurantId },
      include: {
        option_values: {
          orderBy: {
            value_name: 'asc'
          }
        },
      },
      orderBy: {
        option_name: 'asc'
      }
    })

    return NextResponse.json({
      status: 200,
      message: 'Customisation options retrieved successfully',
      data: customisationOptions
    })
  } catch (error) {
    console.error('Error fetching customisation options:', error)
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
    const { optionName, values } = body

    if (!optionName || !values || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Option name and values are required' },
        { status: 400 }
      )
    }

    // Create customisation option with values in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const option = await tx.customisation_options.create({
        data: {
          option_name: optionName,
          restaurant_id: restaurantId,
        },
      })

      const optionValues = await Promise.all(
        values.map((value: { valueName: string; extraPrice: number }) =>
          tx.option_values.create({
            data: {
              option_id: option.id,
              value_name: value.valueName,
              extra_price: value.extraPrice,
            },
          })
        )
      )

      return { option, optionValues }
    })

    return NextResponse.json({
      status: 201,
      message: 'Customisation option created successfully',
      data: result
    })
  } catch (error: any) {
    console.error('Error creating customisation option:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Option name already exists for this restaurant' },
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
    const { optionId, optionName, values } = body

    if (!optionId || !optionName || !values || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json(
        { status: 400, message: 'Option ID, name and values are required' },
        { status: 400 }
      )
    }

    // Verify option belongs to this restaurant
    const existingOption = await prisma.customisation_options.findFirst({
      where: { 
        id: parseInt(optionId),
        restaurant_id: restaurantId
      }
    })

    if (!existingOption) {
      return NextResponse.json(
        { status: 404, message: 'Option not found or access denied' },
        { status: 404 }
      )
    }

    // Update option with values in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update option name
      const option = await tx.customisation_options.update({
        where: { id: parseInt(optionId) },
        data: { option_name: optionName },
      })

      // Delete existing option values
      await tx.option_values.deleteMany({
        where: { option_id: parseInt(optionId) }
      })

      // Create new option values
      const optionValues = await Promise.all(
        values.map((value: { valueName: string; extraPrice: number }) =>
          tx.option_values.create({
            data: {
              option_id: option.id,
              value_name: value.valueName,
              extra_price: value.extraPrice,
            },
          })
        )
      )

      return { option, optionValues }
    })

    return NextResponse.json({
      status: 200,
      message: 'Customisation option updated successfully',
      data: result
    })
  } catch (error: any) {
    console.error('Error updating customisation option:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Option name already exists for this restaurant' },
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
    const optionId = url.searchParams.get('optionId')

    if (!optionId) {
      return NextResponse.json(
        { status: 400, message: 'Option ID is required' },
        { status: 400 }
      )
    }

    // Verify option belongs to this restaurant
    const existingOption = await prisma.customisation_options.findFirst({
      where: { 
        id: parseInt(optionId),
        restaurant_id: restaurantId
      }
    })

    if (!existingOption) {
      return NextResponse.json(
        { status: 404, message: 'Option not found or access denied' },
        { status: 404 }
      )
    }

    // Check if option is used by dishes
    const dishCount = await prisma.dish_available_options.count({
      where: { option_id: parseInt(optionId) }
    })

    if (dishCount > 0) {
      return NextResponse.json(
        { status: 400, message: 'Cannot delete option that is used by dishes' },
        { status: 400 }
      )
    }

    // Delete option and its values in transaction
    await prisma.$transaction(async (tx) => {
      await tx.option_values.deleteMany({
        where: { option_id: parseInt(optionId) }
      })
      await tx.customisation_options.delete({
        where: { id: parseInt(optionId) }
      })
    })

    return NextResponse.json({
      status: 200,
      message: 'Customisation option deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting option:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}