import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId: tableIdStr } = await params
    const tableId = parseInt(tableIdStr)

    if (isNaN(tableId)) {
      return NextResponse.json({
        status: 400,
        message: 'Invalid table ID'
      }, { status: 400 })
    }

    const table = await prisma.tables.findUnique({
      where: { id: tableId },
      select: {
        id: true,
        table_number: true,
        capacity: true,
        restaurant_id: true
      }
    })

    if (!table) {
      return NextResponse.json({
        status: 404,
        message: 'Table not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      status: 200,
      data: table
    })
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json({
      status: 500,
      message: 'Internal server error'
    }, { status: 500 })
  }
}