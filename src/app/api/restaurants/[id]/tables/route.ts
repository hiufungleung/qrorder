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

    const tables = await prisma.tables.findMany({
      where: { restaurant_id: restaurantId },
      orderBy: {
        table_number: 'asc'
      }
    })

    return NextResponse.json({
      status: 200,
      message: 'Tables retrieved successfully',
      data: tables
    })
  } catch (error) {
    console.error('Error fetching tables:', error)
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
    const { tableNumber, capacity } = body

    if (!tableNumber || !capacity) {
      return NextResponse.json(
        { status: 400, message: 'Table number and capacity are required' },
        { status: 400 }
      )
    }

    const table = await prisma.tables.create({
      data: {
        table_number: tableNumber,
        capacity: parseInt(capacity),
        restaurant_id: restaurantId,
      },
    })

    return NextResponse.json({
      status: 201,
      message: 'Table created successfully',
      data: table
    })
  } catch (error: any) {
    console.error('Error creating table:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Table number already exists for this restaurant' },
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
    const { tableId, tableNumber, capacity } = body

    if (!tableId || !tableNumber || !capacity) {
      return NextResponse.json(
        { status: 400, message: 'Table ID, number and capacity are required' },
        { status: 400 }
      )
    }

    // Verify table belongs to this restaurant
    const existingTable = await prisma.tables.findFirst({
      where: { 
        id: parseInt(tableId),
        restaurant_id: restaurantId
      }
    })

    if (!existingTable) {
      return NextResponse.json(
        { status: 404, message: 'Table not found or access denied' },
        { status: 404 }
      )
    }

    const table = await prisma.tables.update({
      where: { id: parseInt(tableId) },
      data: {
        table_number: tableNumber,
        capacity: parseInt(capacity),
      },
    })

    return NextResponse.json({
      status: 200,
      message: 'Table updated successfully',
      data: table
    })
  } catch (error: any) {
    console.error('Error updating table:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { status: 400, message: 'Table number already exists for this restaurant' },
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
    const tableId = url.searchParams.get('tableId')

    if (!tableId) {
      return NextResponse.json(
        { status: 400, message: 'Table ID is required' },
        { status: 400 }
      )
    }

    // Verify table belongs to this restaurant
    const existingTable = await prisma.tables.findFirst({
      where: { 
        id: parseInt(tableId),
        restaurant_id: restaurantId
      }
    })

    if (!existingTable) {
      return NextResponse.json(
        { status: 404, message: 'Table not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.tables.delete({
      where: { id: parseInt(tableId) }
    })

    return NextResponse.json({
      status: 200,
      message: 'Table deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    )
  }
}