import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import yaml from 'js-yaml'
import bcrypt from 'bcryptjs'

interface TemplateData {
  metadata: {
    name: string
    description: string
    version: string
    created: string
    author: string
    tags?: string[]
  }
  restaurant: {
    name: string
    email: string
    password: string
    address?: string
    phone?: string
    isAdmin: boolean
    summary?: string
  }
  customisation_options: Array<{
    name: string
    values: Array<{
      name: string
      extra_price: number
    }>
  }>
  categories: Array<{
    name: string
    description?: string
  }>
  dishes: Array<{
    name: string
    description?: string
    base_price: number
    category: string
    available_options: string[]
  }>
  tables: Array<{
    table_number: string
    capacity: number
  }>
  sample_orders?: Array<{
    customer_name: string
    table_number: string
    status: string
    comment?: string | null
    order_time: string
    items: Array<{
      dish_name: string
      quantity: number
      customizations: Array<{
        option: string
        value: string
      }>
    }>
  }>
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const templateName = searchParams.get('template')
    const newEmail = searchParams.get('email')
    const newPassword = searchParams.get('password')
    const newName = searchParams.get('name')
    const newPhone = searchParams.get('phone')
    const newAddress = searchParams.get('address')
    const newSummary = searchParams.get('summary')

    if (!session?.user?.isAdmin && (!newEmail || !newPassword || !newName || !newPhone || !newAddress)) {
      return NextResponse.json(
        { status: 401, message: 'All restaurant details required for new restaurant creation' },
        { status: 401 }
      )
    }

    let templateData: TemplateData

    if (templateName) {
      // Load built-in template
      const fs = require('fs')
      const path = require('path')
      const templatePath = path.join(process.cwd(), 'public', 'templates', `${templateName}.yaml`)
      
      try {
        const fileContent = fs.readFileSync(templatePath, 'utf8')
        templateData = yaml.load(fileContent) as TemplateData
      } catch (fileError) {
        return NextResponse.json(
          { status: 404, message: `Template '${templateName}' not found` },
          { status: 404 }
        )
      }
    } else {
      // Parse uploaded template data
      const body = await request.text()
      
      try {
        // Try parsing as YAML first
        templateData = yaml.load(body) as TemplateData
      } catch (yamlError) {
        try {
          // Fallback to JSON
          templateData = JSON.parse(body)
        } catch (jsonError) {
          return NextResponse.json(
            { status: 400, message: 'Invalid template format. Must be valid YAML or JSON' },
            { status: 400 }
          )
        }
      }
    }

    // Validate template structure
    if (!templateData.restaurant || !templateData.categories || !templateData.dishes) {
      return NextResponse.json(
        { status: 400, message: 'Invalid template structure. Missing required sections' },
        { status: 400 }
      )
    }

    // Override restaurant details with user input
    if (newEmail) templateData.restaurant.email = newEmail
    if (newPassword) templateData.restaurant.password = newPassword
    if (newName) templateData.restaurant.name = newName
    if (newPhone) templateData.restaurant.phone = newPhone
    if (newAddress) templateData.restaurant.address = newAddress
    
    // Use summary if provided, otherwise use template default or empty
    if (newSummary !== null) {
      templateData.restaurant.summary = newSummary
    }

    // Check if restaurant email already exists
    const existingRestaurant = await prisma.restaurants.findUnique({
      where: { email: templateData.restaurant.email }
    })

    if (existingRestaurant) {
      return NextResponse.json(
        { status: 409, message: 'Restaurant with this email already exists' },
        { status: 409 }
      )
    }

    // Check if restaurant name already exists
    const existingName = await prisma.restaurants.findUnique({
      where: { name: templateData.restaurant.name }
    })

    if (existingName) {
      return NextResponse.json(
        { status: 409, message: `Restaurant name "${templateData.restaurant.name}" is already taken. Please choose a different name.` },
        { status: 409 }
      )
    }

    // Check if phone number already exists
    if (templateData.restaurant.phone) {
      const existingPhone = await prisma.restaurants.findUnique({
        where: { phone: templateData.restaurant.phone }
      })

      if (existingPhone) {
        return NextResponse.json(
          { status: 409, message: `Phone number "${templateData.restaurant.phone}" is already registered. Please use a different phone number.` },
          { status: 409 }
        )
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(templateData.restaurant.password, 12)

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create restaurant
      const newRestaurant = await tx.restaurants.create({
        data: {
          name: templateData.restaurant.name,
          email: templateData.restaurant.email,
          password: hashedPassword,
          address: templateData.restaurant.address || '',
          phone: templateData.restaurant.phone || '',
          is_admin: templateData.restaurant.isAdmin || false,
          summary: templateData.restaurant.summary || null
        }
      })

      // Create customisation options
      const optionMap = new Map<string, number>()
      for (const option of templateData.customisation_options) {
        const createdOption = await tx.customisation_options.create({
          data: {
            option_name: option.name,
            restaurant_id: newRestaurant.restaurant_id
          }
        })
        optionMap.set(option.name, createdOption.option_id)

        // Create option values
        for (const value of option.values) {
          await tx.option_values.create({
            data: {
              value_name: value.name,
              extra_price: value.extra_price,
              option_id: createdOption.option_id
            }
          })
        }
      }

      // Create categories
      const categoryMap = new Map<string, number>()
      for (const category of templateData.categories) {
        const createdCategory = await tx.dish_categories.create({
          data: {
            category_name: category.name,
            restaurant_id: newRestaurant.restaurant_id
          }
        })
        categoryMap.set(category.name, createdCategory.category_id)
      }

      // Create dishes
      const dishMap = new Map<string, number>()
      for (const dish of templateData.dishes) {
        const categoryId = categoryMap.get(dish.category)
        if (!categoryId) {
          throw new Error(`Category '${dish.category}' not found for dish '${dish.name}'`)
        }

        // Generate unique dish name to avoid conflicts
        const uniqueDishName = templateName ? 
          `${dish.name} (${newRestaurant.name})` : 
          dish.name
        
        const createdDish = await tx.dishes.create({
          data: {
            dish_name: uniqueDishName,
            description: dish.description || '',
            base_price: dish.base_price,
            category_id: categoryId
          }
        })
        dishMap.set(dish.name, createdDish.dish_id)

        // Link available options to dish
        for (const optionName of dish.available_options) {
          const optionId = optionMap.get(optionName)
          if (optionId) {
            await tx.dish_available_options.create({
              data: {
                dish_id: createdDish.dish_id,
                option_id: optionId
              }
            })
          }
        }
      }

      // Create tables
      const tableMap = new Map<string, number>()
      for (const table of templateData.tables) {
        const createdTable = await tx.tables.create({
          data: {
            table_number: table.table_number,
            capacity: table.capacity,
            restaurant_id: newRestaurant.restaurant_id
          }
        })
        tableMap.set(table.table_number, createdTable.table_id)
      }

      // Create sample orders if provided
      if (templateData.sample_orders) {
        let orderNumber = 1001 // Start order numbers from 1001

        for (const order of templateData.sample_orders) {
          const tableId = tableMap.get(order.table_number)
          if (!tableId) continue

          const createdOrder = await tx.orders.create({
            data: {
              order_number: orderNumber++,
              customer_name: order.customer_name,
              total_price: 0, // Will be calculated below
              order_time: new Date(order.order_time),
              status: order.status,
              comment: order.comment || null,
              restaurant_id: newRestaurant.restaurant_id,
              table_id: tableId
            }
          })

          let totalPrice = 0

          // Create order details
          for (const item of order.items) {
            const dishId = dishMap.get(item.dish_name)
            if (!dishId) continue

            // Find dish to get base price
            const dish = templateData.dishes.find(d => d.name === item.dish_name)
            if (!dish) continue

            let itemPrice = dish.base_price

            const createdOrderDetail = await tx.order_details.create({
              data: {
                quantity: item.quantity,
                order_id: createdOrder.order_id,
                dish_id: dishId
              }
            })

            // Add customizations
            for (const customization of item.customizations) {
              // Find the option value
              const optionId = optionMap.get(customization.option)
              if (!optionId) continue

              const optionValue = await tx.option_values.findFirst({
                where: {
                  option_id: optionId,
                  value_name: customization.value
                }
              })

              if (optionValue) {
                await tx.order_detail_customisation_options.create({
                  data: {
                    order_detail_id: createdOrderDetail.order_detail_id,
                    value_id: optionValue.value_id
                  }
                })

                itemPrice += parseFloat(optionValue.extra_price.toString())
              }
            }

            totalPrice += itemPrice * item.quantity
          }

          // Update order total price
          await tx.orders.update({
            where: { order_id: createdOrder.order_id },
            data: { total_price: totalPrice }
          })
        }
      }

      return newRestaurant
    })

    return NextResponse.json({
      status: 201,
      message: 'Account created successfully with template',
      restaurant: {
        restaurant_id: result.restaurant_id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        address: result.address,
        summary: result.summary,
        is_admin: result.is_admin
      },
      templateData: {
        categoriesCount: templateData.categories.length,
        dishesCount: templateData.dishes.length,
        tablesCount: templateData.tables.length,
        ordersCount: templateData.sample_orders?.length || 0
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Import error:', error)
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to import template'
    let errorDetails = ''
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        if (error.message.includes('Email')) {
          errorMessage = 'Email address is already registered'
          errorDetails = 'Please use a different email address'
        } else if (error.message.includes('Name')) {
          errorMessage = 'Restaurant name is already taken'
          errorDetails = 'Please choose a different restaurant name'
        } else if (error.message.includes('Phone')) {
          errorMessage = 'Phone number is already registered'
          errorDetails = 'Please use a different phone number'
        }
      } else if (error.message.includes('does not exist')) {
        errorMessage = 'Database schema mismatch'
        errorDetails = 'The database schema may need to be updated. Please restart the application.'
      } else if (error.message.includes('Template') && error.message.includes('not found')) {
        errorMessage = 'Template not found'
        errorDetails = error.message
      } else {
        errorMessage = 'Database operation failed'
        errorDetails = error.message
      }
    }
    
    return NextResponse.json(
      { 
        status: 500, 
        message: errorMessage,
        details: errorDetails,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}