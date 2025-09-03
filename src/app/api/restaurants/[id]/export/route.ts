import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import yaml from 'js-yaml'

interface ExportParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: ExportParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const restaurantId = parseInt(id)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'yaml' // yaml, json
    const includeOrders = searchParams.get('includeOrders') === 'true'

    if (!session) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      return NextResponse.json(
        { status: 403, message: 'Access denied' },
        { status: 403 }
      )
    }

    // Fetch complete restaurant data
    const restaurant = await prisma.restaurants.findUnique({
      where: { id: restaurantId },
      include: {
        dish_categories: {
          include: {
            dishes: {
              include: {
                dish_available_options: {
                  include: { customisation_options: true }
                }
              }
            }
          },
          orderBy: { id: 'asc' }
        },
        customisation_options: {
          include: {
            option_values: {
              orderBy: { id: 'asc' }
            }
          },
          orderBy: { id: 'asc' }
        },
        tables: {
          orderBy: { id: 'asc' }
        },
        ...(includeOrders && {
          orders: {
            include: {
              tables: true,
              order_details: {
                include: {
                  dishes: true,
                  order_detail_customisation_options: {
                    include: {
                      option_values: true
                    }
                  }
                }
              }
            },
            orderBy: { order_time: 'desc' }
          }
        })
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { status: 404, message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Transform data to template format
    const templateData = {
      metadata: {
        name: restaurant.name,
        description: `Export of ${restaurant.name} restaurant data`,
        version: "1.0.0",
        created: new Date().toISOString().split('T')[0],
        author: "QR Order System",
        exported_from: `Restaurant ID ${restaurantId}`,
        tags: ["exported", "restaurant-data"]
      },
      restaurant: {
        name: restaurant.name,
        email: restaurant.email,
        // Don't export password hash for security
        password: "CHANGE_ME_ON_IMPORT",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        isAdmin: restaurant.is_admin
      },
      customisation_options: (restaurant as any).customisation_options.map((option: any) => ({
        name: option.option_name,
        values: option.option_values.map((value: any) => ({
          name: value.value_name,
          extra_price: parseFloat(value.extra_price.toString())
        }))
      })),
      categories: (restaurant as any).dish_categories.map((category: any) => ({
        name: category.category_name,
        description: category.description || ""
      })),
      dishes: (restaurant as any).dish_categories.flatMap((category: any) => 
        category.dishes.map((dish: any) => ({
          name: dish.dish_name,
          description: dish.description || "",
          base_price: parseFloat(dish.base_price.toString()),
          category: category.category_name,
          available_options: dish.dish_available_options.map((opt: any) => 
            opt.customisation_options.option_name
          )
        }))
      ),
      tables: (restaurant as any).tables.map((table: any) => ({
        table_number: table.table_number,
        capacity: table.capacity
      })),
      ...(includeOrders && {
        sample_orders: (restaurant as any).orders.map((order: any) => ({
          customer_name: order.customer_name,
          table_number: order.tables.table_number,
          status: order.status,
          comment: order.comment,
          order_time: order.order_time.toISOString(),
          items: order.order_details.map((detail: any) => ({
            dish_name: detail.dishes.dish_name,
            quantity: detail.quantity,
            customizations: detail.order_detail_customisation_options.map((opt: any) => ({
              option: opt.option_values.customisation_options?.option_name || "Unknown",
              value: opt.option_values.value_name
            }))
          }))
        }))
      })
    }

    // Format output based on requested format
    let content: string
    let contentType: string
    let filename: string

    if (format === 'json') {
      content = JSON.stringify(templateData, null, 2)
      contentType = 'application/json'
      filename = `${restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`
    } else {
      content = yaml.dump(templateData, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true 
      })
      contentType = 'application/x-yaml'
      filename = `${restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.yaml`
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { status: 500, message: 'Failed to export restaurant data' },
      { status: 500 }
    )
  }
}