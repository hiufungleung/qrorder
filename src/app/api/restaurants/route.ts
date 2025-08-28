import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { status: 403, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const restaurants = await prisma.restaurants.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ]
      } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        is_admin: true,
        summary: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      status: 200,
      message: 'Restaurants retrieved successfully',
      data: restaurants
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { status: 403, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, phone, address, password, isAdmin, summary } = body

    // Validate required fields
    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json(
        { status: 400, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const restaurant = await prisma.restaurants.create({
      data: {
        name,
        email,
        phone,
        address,
        password: hashedPassword,
        is_admin: isAdmin || false,
        summary,
      },
    })

    // Remove password from response
    const { password: _, ...restaurantResponse } = restaurant

    return NextResponse.json({
      status: 201,
      message: 'Restaurant created successfully',
      data: restaurantResponse
    })
  } catch (error: any) {
    console.error('Error creating restaurant:', error)
    
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