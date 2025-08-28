import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

interface Params {
  id: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const orderId = parseInt((await params).id)
    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses: OrderStatus[] = ['Pending', 'Making', 'Completed', 'Cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { status: 400, message: 'Invalid order status' },
        { status: 400 }
      )
    }

    // Get order to check restaurant ownership
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: { restaurant_id: true }
    })

    if (!order) {
      return NextResponse.json(
        { status: 404, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== order.restaurant_id) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { status },
      select: {
        id: true,
        order_number: true,
        status: true,
        restaurant_id: true
      }
    })

    return NextResponse.json({
      status: 200,
      message: 'Order status updated successfully',
      data: updatedOrder
    })
  } catch (error: any) {
    console.error('Error updating order status:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { status: 404, message: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}