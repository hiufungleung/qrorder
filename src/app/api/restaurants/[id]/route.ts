import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    const restaurant = await prisma.restaurants.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        is_admin: true,
        summary: true,
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { status: 404, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 200,
      message: 'Restaurant retrieved successfully',
      data: restaurant
    })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
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

    const restaurantId = parseInt(params.id)

    // Check access permissions - allow admins or restaurant owners
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }
    const body = await request.json()
    const { name, email, phone, address, password, isAdmin, summary } = body

    // Validate required fields
    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { status: 400, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      address,
      summary,
    }

    // Only allow admins to change admin status
    if (session.user.isAdmin && typeof isAdmin === 'boolean') {
      updateData.is_admin = isAdmin
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const restaurant = await prisma.restaurants.update({
      where: { id: restaurantId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        is_admin: true,
        summary: true,
      }
    })

    return NextResponse.json({
      status: 200,
      message: 'Restaurant updated successfully',
      data: restaurant
    })
  } catch (error: any) {
    console.error('Error updating restaurant:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: `${error.meta?.target?.[0]} already exists` },
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
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { status: 403, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const restaurantId = parseInt(params.id)

    await prisma.restaurants.delete({
      where: { id: restaurantId }
    })

    return NextResponse.json({
      status: 200,
      message: 'Restaurant deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting restaurant:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { status: 404, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}