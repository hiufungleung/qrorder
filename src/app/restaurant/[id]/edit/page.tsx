'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SessionRestaurantLayout } from '@/components/layout/session-restaurant-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Restaurant } from '@/types'

export default function EditRestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const restaurantId = parseInt(params.id as string)
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    isAdmin: false
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Check if user has access to edit this restaurant
    if (!session.user.isAdmin && session.user.restaurantId !== restaurantId) {
      router.push('/restaurant')
      return
    }

    fetchRestaurant()
  }, [session, status, router, restaurantId])

  const fetchRestaurant = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/restaurants/${restaurantId}`)
      const data = await response.json()
      
      if (data.status === 200) {
        setRestaurant(data.data)
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          address: data.data.address,
          summary: data.data.summary || '',
          isAdmin: data.data.isAdmin
        })
      } else {
        setError('Failed to fetch restaurant data')
      }
    } catch (error) {
      setError('Failed to fetch restaurant data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.status === 200) {
        setSuccess('Restaurant updated successfully!')
        fetchRestaurant() // Refresh data
      } else {
        setError(data.message || 'Failed to update restaurant')
      }
    } catch (error) {
      setError('An error occurred while updating')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    })
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

  if (error && !restaurant) {
    return (
      <SessionRestaurantLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
          <Button onClick={() => fetchRestaurant()} className="mt-4">
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
            <h1 className="text-3xl font-bold">Edit Restaurant</h1>
            <p className="text-gray-600 dark:text-gray-400">Update restaurant information and settings</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>Update the basic information for this restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Messages */}
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Restaurant Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Restaurant Name"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="restaurant@example.com"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main St, City, State"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="summary" className="text-sm font-medium">
                  Restaurant Description
                </label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Tell customers about your restaurant"
                  disabled={saving}
                  rows={4}
                />
              </div>

              {session?.user?.isAdmin && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAdmin"
                      checked={formData.isAdmin}
                      onChange={handleCheckboxChange}
                      disabled={saving}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">
                      Grant Admin Privileges
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin users can manage all restaurants and access the admin panel.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SessionRestaurantLayout>
  )
}