'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Order, OrderStatus } from '@/types'

export default function OrderStatusPage() {
  const searchParams = useSearchParams()
  const restaurantId = parseInt(searchParams.get('restaurantId') || '1')
  const orderNumber = parseInt(searchParams.get('orderNumber') || '1')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (restaurantId && orderNumber) {
      fetchOrderStatus()
      // Set up polling for real-time updates
      const interval = setInterval(fetchOrderStatus, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [restaurantId, orderNumber])

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`/api/public/orders?restaurantId=${restaurantId}&orderNumber=${orderNumber}`)
      const data = await response.json()
      
      if (data.status === 200) {
        setOrder(data.data)
        setError('')
      } else {
        setError(data.message || 'Order not found')
      }
    } catch (error) {
      setError('Failed to fetch order status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          message: 'Your order has been received and is being prepared.',
          icon: '⏳'
        }
      case 'Making':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          message: 'Your order is currently being prepared by our kitchen.',
          icon: '👨‍🍳'
        }
      case 'Completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          message: 'Your order is ready! Please collect it from the counter.',
          icon: '✅'
        }
      case 'Cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          message: 'Your order has been cancelled.',
          icon: '❌'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          message: 'Unknown status',
          icon: '❓'
        }
    }
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString()
  }

  const calculateItemTotal = (detail: any) => {
    const basePrice = detail.dishes.base_price
    const customizationTotal = detail.order_detail_customisation_options.reduce(
      (sum: number, option: any) => sum + Number(option.option_values.extra_price),
      0
    )
    return (Number(basePrice) + customizationTotal) * detail.quantity
  }

  const formatOrderItems = (orderDetails: any[]) => {
    return (
      <div className="space-y-4">
        {orderDetails.map((detail, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {detail.quantity}x {detail.dishes.dish_name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Base price: A${Number(detail.dishes.base_price).toFixed(2)} each
                </p>
              </div>
            </div>
            
            {/* Customizations */}
            {detail.order_detail_customisation_options.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Customizations:</h5>
                <div className="space-y-1">
                  {detail.order_detail_customisation_options.map((option: any, optionIndex: number) => (
                    <div key={optionIndex} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">+ {option.option_values.value_name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">A${Number(option.option_values.extra_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Item Total */}
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between font-medium">
                <span className="text-gray-700 dark:text-gray-300">Item Total:</span>
                <span className="text-gray-900 dark:text-white">A${calculateItemTotal(detail).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || 'Order not found'}
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Order Status</h1>
          <p className="text-muted-foreground mt-2">
            Track your order from {order.restaurant?.name}
          </p>
        </div>

        <div className="space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.order_number}</CardTitle>
                <span className={`px-3 py-1 rounded-full border ${statusInfo.color} font-medium`}>
                  {statusInfo.icon} {order.status}
                </span>
              </div>
              <CardDescription>
                Placed on {formatDateTime(order.order_time)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-lg font-medium mb-2">{statusInfo.message}</p>
                <p className="text-sm text-muted-foreground">
                  We'll update this page automatically when your order status changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Customer: {order.customer_name} • Table {order.table?.table_number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Items Ordered</h3>
                  {order.order_details && formatOrderItems(order.order_details)}
                </div>

                {/* Order Comment */}
                {order.comment && (
                  <div>
                    <h3 className="font-medium mb-2">Special Instructions</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {order.comment}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>A${Number(order.total_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href={`/ordering?restaurantId=${restaurantId}&tableId=${order.table_id}`}>
                Order More Items
              </Link>
            </Button>
          </div>

          {/* Auto-refresh indicator */}
          <div className="text-center text-sm text-muted-foreground">
            <p>This page refreshes automatically every 5 seconds</p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={fetchOrderStatus}
              className="p-0 h-auto"
            >
              Refresh now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}