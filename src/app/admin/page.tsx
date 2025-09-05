'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Restaurant } from '@/types'
import { X } from 'lucide-react'

// Modal component for editing restaurants
function RestaurantEditModal({ isOpen, onClose, onSubmit, restaurant = null }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  restaurant?: Restaurant | null
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    summary: ''
  })

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        summary: restaurant.summary || ''
      })
    } else {
      setFormData({ name: '', email: '', phone: '', address: '', summary: '' })
    }
  }, [restaurant, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...formData, restaurantId: restaurant?.id })
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Restaurant Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter restaurant name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter restaurant address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Summary (Optional)</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief description of the restaurant"
                rows={3}
              />
            </div>
          </div>
          <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Restaurant</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState<{show: boolean, message: string}>({show: false, message: ''})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, restaurant: Restaurant | null}>({show: false, restaurant: null})

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async (search?: string) => {
    try {
      setLoading(true)
      const url = new URL('/api/restaurants', window.location.origin)
      if (search) {
        url.searchParams.set('search', search)
      }
      
      const response = await fetch(url.toString())
      const data = await response.json()
      
      if (data.status === 200) {
        setRestaurants(data.data)
      } else {
        setError(data.message || 'Failed to fetch restaurants')
      }
    } catch (error) {
      setError('Failed to fetch restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRestaurants(searchTerm)
  }

  const handleDeleteClick = (restaurant: Restaurant) => {
    setShowDeleteConfirm({show: true, restaurant})
  }

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm.restaurant) return
    
    const {id, name} = showDeleteConfirm.restaurant
    setShowDeleteConfirm({show: false, restaurant: null})

    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setRestaurants(restaurants.filter(r => r.id !== id))
        showSuccess('Restaurant deleted successfully!')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete restaurant')
      }
    } catch (error) {
      setError('Failed to delete restaurant')
    }
  }

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setShowEditModal(true)
  }

  const handleUpdateRestaurant = async (data: any) => {
    try {
      const response = await fetch(`/api/restaurants/${data.restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        setRestaurants(restaurants.map(r => 
          r.id === data.restaurantId ? result.data : r
        ))
        showSuccess('Restaurant updated successfully!')
        setEditingRestaurant(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update restaurant')
      }
    } catch (error) {
      setError('Failed to update restaurant')
    }
  }

  const showSuccess = (message: string) => {
    setShowSuccessMessage({show: true, message})
    setTimeout(() => {
      setShowSuccessMessage({show: false, message: ''})
    }, 3000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurant Management</h1>
            <p className="text-muted-foreground">Admin Panel - Manage all restaurants</p>
          </div>
          <Button asChild>
            <Link href="/admin/restaurants/create">Add Restaurant</Link>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Restaurants</CardTitle>
            <CardDescription>
              Search by name, email, or phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter search term..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        {/* Restaurants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurants</CardTitle>
            <CardDescription>
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No restaurants found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.email}</TableCell>
                      <TableCell>{restaurant.phone}</TableCell>
                      <TableCell>{restaurant.address}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          restaurant.is_admin 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {restaurant.is_admin ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/restaurant?restaurantId=${restaurant.id}`}>Manage</Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditRestaurant(restaurant)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(restaurant)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Restaurant Modal */}
      <RestaurantEditModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingRestaurant(null)
        }}
        onSubmit={handleUpdateRestaurant}
        restaurant={editingRestaurant}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm({show: false, restaurant: null})
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Restaurant
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "<strong>{showDeleteConfirm.restaurant?.name}</strong>"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm({show: false, restaurant: null})}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete Restaurant
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessMessage.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {showSuccessMessage.message}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}