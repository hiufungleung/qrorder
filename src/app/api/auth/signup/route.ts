import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address, password, summary, isAdmin = false } = await request.json()

    // Validate required fields
    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json(
        { message: 'All required fields must be provided', status: 400 },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.restaurants.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered', status: 409 },
        { status: 409 }
      )
    }

    // Check if restaurant name already exists
    const existingName = await prisma.restaurants.findUnique({
      where: { name }
    })

    if (existingName) {
      return NextResponse.json(
        { message: `Restaurant name "${name}" is already taken. Please choose a different name.`, status: 409 },
        { status: 409 }
      )
    }

    // Check if phone number already exists
    const existingPhone = await prisma.restaurants.findUnique({
      where: { phone }
    })

    if (existingPhone) {
      return NextResponse.json(
        { message: `Phone number "${phone}" is already registered. Please use a different phone number.`, status: 409 },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new restaurant/user
    const newRestaurant = await prisma.restaurants.create({
      data: {
        name,
        email,
        phone,
        address,
        password: hashedPassword,
        summary: summary || '',
        is_admin: isAdmin || false
      }
    })

    // Create default table for the new restaurant
    await prisma.tables.create({
      data: {
        table_number: 'Table 1',
        capacity: 4,
        restaurant_id: newRestaurant.restaurant_id
      }
    })

    // Remove password from response
    const { password: _, ...restaurantWithoutPassword } = newRestaurant

    return NextResponse.json(
      { 
        message: 'Account created successfully', 
        status: 201,
        restaurant: restaurantWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error', status: 500 },
      { status: 500 }
    )
  }
}