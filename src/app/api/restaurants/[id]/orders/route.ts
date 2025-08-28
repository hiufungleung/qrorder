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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = { restaurant_id: restaurantId }
    if (status) {
      whereClause.status = status
    }

    const orders = await prisma.orders.findMany({
      where: whereClause,
      include: {
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
      },
      orderBy: {
        order_time: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      status: 200,
      message: 'Orders retrieved successfully',
      data: orders
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}