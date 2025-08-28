'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionRestaurantLayout } from '@/components/layout/session-restaurant-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Order {
  id: number
  order_number: number
  customer_name: string
  total_price: number
  order_time: string
  status: string
  comment?: string
  table: {
    table_number: string
  }
  orderDetails: {
    quantity: number
    dish: {
      dish_name: string
      base_price: number
    }
    orderDetailCustomisationOptions: {
      value: {
        value_name: string
        extra_price: number
      }
    }[]
  }[]
}

export default function RestaurantOrders() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Support both admin access via ?restaurantId=X and non-admin access via session
  const restaurantId = searchParams.get('restaurantId') 
    ? parseInt(searchParams.get('restaurantId')!) 
    : (session?.user?.isAdmin ? null : session?.user?.restaurantId)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Admin must provide restaurantId via query param, non-admin uses their own restaurant
    if (!restaurantId) {
      if (session.user.isAdmin) {
        setError('Please select a restaurant to view orders. Admin users must specify ?restaurantId=X')
        setLoading(false)
      } else {
        setError('No restaurant associated with your account')
      }
      return
    }

    // Check access permissions
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      router.push('/restaurant')
      return
    }

    fetchOrders()
    // Set up polling for real-time updates (without showing loading spinner)
    const interval = setInterval(() => fetchOrders(false), 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [session, status, router, restaurantId])

  const fetchOrders = async (showLoading = true) => {
    if (!restaurantId) return

    try {
      if (showLoading) {
        setLoading(true)
      }
      const response = await fetch(`/api/restaurants/${restaurantId}/orders`)
      const data = await response.json()

      if (data.status === 200) {
        setOrders(data.data)
      } else {
        setError('Failed to fetch orders')
      }
    } catch (error) {
      setError('Failed to fetch orders')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.status === 200) {
        // Refresh orders without loading spinner for immediate feedback
        fetchOrders(false)
      } else {
        setError('Failed to update order status')
      }
    } catch (error) {
      setError('Failed to update order status')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      'Pending': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      'Making': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      'Completed': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles] || styles.Cancelled}`}>
        {status}
      </span>
    )
  }

  const calculateItemTotal = (detail: Order['orderDetails'][0]) => {
    const basePrice = detail.dish.base_price
    const customizationTotal = detail.orderDetailCustomisationOptions.reduce(
      (sum, option) => sum + Number(option.value.extra_price),
      0
    )
    return (Number(basePrice) + customizationTotal) * detail.quantity
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString()
  }

  if (loading) {
    return (
      <SessionRestaurantLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SessionRestaurantLayout>
    )
  }

  if (error) {
    return (
      <SessionRestaurantLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
          <Button onClick={() => fetchOrders()} className="mt-4">
            Try Again
          </Button>
        </div>
      </SessionRestaurantLayout>
    )
  }

  return (
    <SessionRestaurantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage incoming orders and track their status</p>
          </div>
          <Button onClick={() => fetchOrders()} variant="outline">
            Refresh Orders
          </Button>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Orders</CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                {orders.filter(o => o.status === 'Pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {orders.filter(o => o.status === 'Making').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed Today</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {orders.filter(o => o.status === 'Completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl text-indigo-600">
                A${orders.reduce((sum, order) => sum + Number(order.total_price), 0).toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>All orders for this restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No orders found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.order_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.table.table_number}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openOrderDetail(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                      <TableCell>A${Number(order.total_price).toFixed(2)}</TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(order.order_time)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === 'Pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'Making')}
                            >
                              Start Making
                            </Button>
                          )}
                          {order.status === 'Making' && (
                            <Button 
                              size="sm"
                              variant="default"
                              onClick={() => updateOrderStatus(order.id, 'Completed')}
                            >
                              Mark Complete
                            </Button>
                          )}
                          {(order.status === 'Pending' || order.status === 'Making') && (
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Customer</h3>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Table</h3>
                    <p className="font-medium">{selectedOrder.table.table_number}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Order Time</h3>
                    <p className="font-medium">{formatDateTime(selectedOrder.order_time)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Status</h3>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.comment && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Special Instructions</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-yellow-800 dark:text-yellow-200">{selectedOrder.comment}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.orderDetails.map((detail, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{detail.quantity}x {detail.dish.dish_name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Base price: A${Number(detail.dish.base_price).toFixed(2)} each</p>
                          </div>
                        </div>
                        
                        {/* Customizations */}
                        {detail.orderDetailCustomisationOptions.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Customizations:</h5>
                            <div className="space-y-1">
                              {detail.orderDetailCustomisationOptions.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">+ {option.value.value_name}</span>
                                  <span className="font-medium">A${Number(option.value.extra_price).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Item Total */}
                        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between font-medium">
                            <span>Item Total:</span>
                            <span>A${calculateItemTotal(detail).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Total Amount:</span>
                    <span className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">A${Number(selectedOrder.total_price).toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedOrder.status === 'Pending' && (
                    <>
                      <Button 
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'Making')
                          setIsDetailModalOpen(false)
                        }}
                        className="flex-1"
                      >
                        Start Making
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'Cancelled')
                          setIsDetailModalOpen(false)
                        }}
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === 'Making' && (
                    <>
                      <Button 
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'Completed')
                          setIsDetailModalOpen(false)
                        }}
                        className="flex-1"
                      >
                        Mark Complete
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'Cancelled')
                          setIsDetailModalOpen(false)
                        }}
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SessionRestaurantLayout>
  )
}