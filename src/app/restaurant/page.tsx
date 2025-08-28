'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SessionRestaurantLayout } from '@/components/layout/session-restaurant-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Restaurant, DishCategory, CustomisationOption, Dish, Table as RestaurantTable } from '@/types'
import { X, Plus, Trash2 } from 'lucide-react'

// Modal component for adding/editing categories
function CategoryModal({ isOpen, onClose, onSubmit, category = null }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  category?: any
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (category) {
      setName(category.category_name || '')
    } else {
      setName('')
    }
  }, [category, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (category) {
      // Editing existing category
      onSubmit({ categoryId: category.id, category_name: name })
    } else {
      // Adding new category
      onSubmit({ category_name: name })
    }
    setName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">
              {category ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Appetizers, Main Courses, Desserts"
                required
              />
            </div>
          </div>
          <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Category</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal for customization options
function OptionModal({ isOpen, onClose, onSubmit, option = null }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  option?: CustomisationOption | null
}) {
  const [optionName, setOptionName] = useState('')
  const [values, setValues] = useState([{ value_name: '', extra_price: 0 }])

  useEffect(() => {
    if (option) {
      setOptionName(option.option_name || '')
      setValues(option.optionValues?.length ? option.optionValues.map(v => ({ value_name: v.value_name, extra_price: v.extra_price })) : [{ value_name: '', extra_price: 0 }])
    } else {
      setOptionName('')
      setValues([{ value_name: '', extra_price: 0 }])
    }
  }, [option, isOpen])

  if (!isOpen) return null

  const addValue = () => {
    setValues([...values, { value_name: '', extra_price: 0 }])
  }

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index))
  }

  const updateValue = (index: number, field: string, value: any) => {
    const newValues = [...values]
    newValues[index] = { ...newValues[index], [field]: value }
    setValues(newValues)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { 
      option_name: optionName, 
      values: values.filter(v => v.value_name) 
    }
    if (option) {
      data.optionId = option.id
    }
    onSubmit(data)
    setOptionName('')
    setValues([{ value_name: '', extra_price: 0 }])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">{option ? 'Edit Customization Option' : 'Add Customization Option'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Option Name</label>
              <Input
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                placeholder="e.g., Size, Temperature, Spice Level"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium dark:text-gray-300">Option Values</label>
                <Button type="button" size="sm" onClick={addValue}>
                  <Plus className="h-4 w-4 mr-1" /> Add Value
                </Button>
              </div>
              <div className="space-y-2">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Value name (e.g., Small, Large)"
                      value={value.value_name}
                      onChange={(e) => updateValue(index, 'value_name', e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Extra price"
                      value={value.extra_price}
                      onChange={(e) => updateValue(index, 'extra_price', parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                    {values.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeValue(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Option</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal for dishes
function DishModal({ isOpen, onClose, onSubmit, categories, options, dish = null }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  categories: DishCategory[]
  options: CustomisationOption[]
  dish?: Dish | null
}) {
  const [dishData, setDishData] = useState({
    dishName: '',
    description: '',
    basePrice: 0,
    categoryId: '',
    selectedOptions: [] as number[]
  })

  useEffect(() => {
    if (dish) {
      setDishData({
        dishName: dish.dish_name || '',
        description: dish.description || '',
        basePrice: dish.base_price || 0,
        categoryId: dish.category?.id?.toString() || '',
        selectedOptions: dish.availableOptions?.map(opt => opt.option.id) || []
      })
    } else {
      setDishData({
        dishName: '',
        description: '',
        basePrice: 0,
        categoryId: '',
        selectedOptions: []
      })
    }
  }, [dish, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...dishData }
    if (dish) {
      data.dishId = dish.id
    }
    onSubmit(data)
    setDishData({
      dishName: '',
      description: '',
      basePrice: 0,
      categoryId: '',
      selectedOptions: []
    })
    onClose()
  }

  const toggleOption = (optionId: number) => {
    setDishData(prev => ({
      ...prev,
      selectedOptions: prev.selectedOptions.includes(optionId)
        ? prev.selectedOptions.filter(id => id !== optionId)
        : [...prev.selectedOptions, optionId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">{dish ? 'Edit Dish' : 'Add New Dish'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Dish Name</label>
              <Input
                value={dishData.dishName}
                onChange={(e) => setDishData({...dishData, dishName: e.target.value})}
                placeholder="Enter dish name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description</label>
              <Textarea
                value={dishData.description}
                onChange={(e) => setDishData({...dishData, description: e.target.value})}
                placeholder="Enter dish description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
                <select
                  value={dishData.categoryId}
                  onChange={(e) => setDishData({...dishData, categoryId: e.target.value})}
                  className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Base Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={dishData.basePrice}
                  onChange={(e) => setDishData({...dishData, basePrice: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {options.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Available Options</label>
                <div className="space-y-2 border dark:border-gray-600 rounded-lg p-3">
                  {options.map(option => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dishData.selectedOptions.includes(option.id)}
                        onChange={() => toggleOption(option.id)}
                        className="rounded"
                      />
                      <span className="dark:text-gray-300">{option.option_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Dish</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal for restaurant profile editing
function RestaurantProfileModal({ isOpen, onClose, onSubmit, restaurant = null }: {
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
    summary: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        email: restaurant.email || '',
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        summary: restaurant.summary || '',
        password: '',
        confirmPassword: ''
      })
    } else {
      setFormData({ name: '', email: '', phone: '', address: '', summary: '', password: '', confirmPassword: '' })
    }
  }, [restaurant, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const data = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      summary: formData.summary
    }
    
    if (formData.password) {
      data.password = formData.password
    }
    
    onSubmit(data)
    setFormData({ name: '', email: '', phone: '', address: '', summary: '', password: '', confirmPassword: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">Edit Restaurant Profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description (Optional)</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief description of the restaurant"
                rows={3}
              />
            </div>
            <hr className="my-4" />
            <div>
              <h3 className="text-lg font-medium mb-2 dark:text-white">Change Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Leave password fields empty if you don't want to change your password.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">New Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Confirm Password</label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal for tables
function TableModal({ isOpen, onClose, onSubmit, table = null }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  table?: RestaurantTable | null
}) {
  const [tableData, setTableData] = useState({
    tableNumber: '',
    capacity: 4
  })

  useEffect(() => {
    if (table) {
      setTableData({
        tableNumber: table.table_number || '',
        capacity: table.capacity || 4
      })
    } else {
      setTableData({
        tableNumber: '',
        capacity: 4
      })
    }
  }, [table, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...tableData }
    if (table) {
      data.tableId = table.id
    }
    onSubmit(data)
    setTableData({ tableNumber: '', capacity: 4 })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">{table ? 'Edit Table' : 'Add New Table'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Table Number/Name</label>
              <Input
                value={tableData.tableNumber}
                onChange={(e) => setTableData({...tableData, tableNumber: e.target.value})}
                placeholder="e.g., Table 1, A1, VIP-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Capacity</label>
              <Input
                type="number"
                min="1"
                value={tableData.capacity}
                onChange={(e) => setTableData({...tableData, capacity: parseInt(e.target.value) || 1})}
                placeholder="Number of seats"
                required
              />
            </div>
          </div>
          <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Table</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RestaurantDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [dishCategories, setDishCategories] = useState<DishCategory[]>([])
  const [customisationOptions, setCustomisationOptions] = useState<CustomisationOption[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showOptionModal, setShowOptionModal] = useState(false)
  const [showDishModal, setShowDishModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<DishCategory | null>(null)
  const [editingOption, setEditingOption] = useState<CustomisationOption | null>(null)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, type: string, id: number, name: string}>({show: false, type: '', id: 0, name: ''})
  const [showSuccessMessage, setShowSuccessMessage] = useState<{show: boolean, message: string}>({show: false, message: ''})

  const fetchRestaurantData = useCallback(async () => {
    if (!session?.user?.restaurantId) return

    try {
      setLoading(true)
      const restaurantId = session.user.restaurantId
      
      // Fetch all data in a single bundled API call
      const response = await fetch(`/api/restaurants/${restaurantId}/dashboard`)
      const data = await response.json()

      if (data.status === 200) {
        setRestaurant(data.data.restaurant)
        setDishCategories(data.data.categories)
        setCustomisationOptions(data.data.customisationOptions)
        setDishes(data.data.dishes)
        setTables(data.data.tables)
      } else {
        setError(data.message || 'Failed to fetch restaurant data')
      }
      
    } catch (error) {
      setError('Failed to fetch restaurant data')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.restaurantId])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Allow admins to view restaurants but redirect if no restaurant ID is provided
    if (session.user.isAdmin && !session.user.restaurantId) {
      router.push('/admin')
      return
    }

    if (!session.user.restaurantId) {
      setError('No restaurant associated with your account')
      return
    }

    fetchRestaurantData()
  }, [session?.user?.restaurantId, status, fetchRestaurantData])

  const handleAddCategory = async (data: any) => {
    try {
      const url = `/api/restaurants/${session?.user?.restaurantId}/categories`
      const method = data.categoryId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        // Update local state instead of full page refresh
        const result = await response.json()
        if (data.categoryId) {
          // Update existing category
          setDishCategories(categories => 
            categories.map(cat => 
              cat.id === data.categoryId 
                ? { ...cat, category_name: data.category_name }
                : cat
            )
          )
          showSuccess('Category updated successfully!')
        } else {
          // Add new category
          setDishCategories(categories => [...categories, result.data])
          showSuccess('Category added successfully!')
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to save category:', errorData.message)
      }
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  const handleEditCategory = (category: DishCategory) => {
    setEditingCategory(category)
    setShowCategoryModal(true)
  }

  const handleAddOption = async (data: any) => {
    try {
      const url = `/api/restaurants/${session?.user?.restaurantId}/customisation-options`
      const method = data.optionId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (data.optionId) {
          // Update existing option
          const updatedOption = {
            ...result.data.option,
            optionValues: result.data.optionValues || []
          }
          setCustomisationOptions(options => 
            options.map(opt => 
              opt.id === data.optionId ? updatedOption : opt
            )
          )
          showSuccess('Option updated successfully!')
        } else {
          // Add new option
          const newOption = {
            ...result.data.option,
            optionValues: result.data.optionValues || []
          }
          setCustomisationOptions(options => [...options, newOption])
          showSuccess('Option added successfully!')
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to save option:', errorData.message)
      }
    } catch (error) {
      console.error('Failed to save option:', error)
    }
  }

  const handleAddDish = async (data: any) => {
    try {
      const url = `/api/restaurants/${session?.user?.restaurantId}/dishes`
      const method = data.dishId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        const category = dishCategories.find(cat => cat.id === parseInt(data.categoryId))
        
        if (data.dishId) {
          // Update existing dish
          const dishWithCategory = {
            ...result.data,
            category: { id: category?.id, category_name: category?.category_name }
          }
          setDishes(dishes => 
            dishes.map(dish => 
              dish.id === data.dishId ? dishWithCategory : dish
            )
          )
          showSuccess('Dish updated successfully!')
        } else {
          // Add new dish
          const dishWithCategory = {
            ...result.data,
            category: { id: category?.id, category_name: category?.category_name }
          }
          setDishes(dishes => [...dishes, dishWithCategory])
          showSuccess('Dish added successfully!')
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to save dish:', errorData.message)
      }
    } catch (error) {
      console.error('Failed to save dish:', error)
    }
  }

  const handleAddTable = async (data: any) => {
    try {
      const url = `/api/restaurants/${session?.user?.restaurantId}/tables`
      const method = data.tableId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (data.tableId) {
          // Update existing table
          setTables(tables => 
            tables.map(table => 
              table.id === data.tableId ? result.data : table
            )
          )
          showSuccess('Table updated successfully!')
        } else {
          // Add new table
          setTables(tables => [...tables, result.data])
          showSuccess('Table added successfully!')
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to save table:', errorData.message)
      }
    } catch (error) {
      console.error('Failed to save table:', error)
    }
  }

  const showSuccess = (message: string) => {
    setShowSuccessMessage({show: true, message})
    setTimeout(() => {
      setShowSuccessMessage({show: false, message: ''})
    }, 3000)
  }

  const handleUpdateProfile = async (data: any) => {
    try {
      const response = await fetch(`/api/restaurants/${session?.user?.restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        setRestaurant(result.data)
        showSuccess('Restaurant profile updated successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to update profile:', errorData.message)
        alert('Failed to update profile: ' + errorData.message)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleEditOption = (option: CustomisationOption) => {
    setEditingOption(option)
    setShowOptionModal(true)
  }

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish)
    setShowDishModal(true)
  }

  const handleEditTable = (table: RestaurantTable) => {
    setEditingTable(table)
    setShowTableModal(true)
  }

  const handleDeleteConfirm = (type: string, id: number, name: string) => {
    setShowDeleteConfirm({show: true, type, id, name})
  }

  const handleDelete = async () => {
    const { type, id } = showDeleteConfirm
    try {
      const endpoints = {
        category: 'categories',
        option: 'customisation-options',
        dish: 'dishes',
        table: 'tables'
      }
      
      const params = {
        category: `categoryId=${id}`,
        option: `optionId=${id}`,
        dish: `dishId=${id}`,
        table: `tableId=${id}`
      }
      
      const response = await fetch(`/api/restaurants/${session?.user?.restaurantId}/${endpoints[type as keyof typeof endpoints]}?${params[type as keyof typeof params]}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Update local state
        switch (type) {
          case 'category':
            setDishCategories(categories => categories.filter(cat => cat.id !== id))
            showSuccess('Category deleted successfully!')
            break
          case 'option':
            setCustomisationOptions(options => options.filter(opt => opt.id !== id))
            showSuccess('Option deleted successfully!')
            break
          case 'dish':
            setDishes(dishes => dishes.filter(dish => dish.id !== id))
            showSuccess('Dish deleted successfully!')
            break
          case 'table':
            setTables(tables => tables.filter(table => table.id !== id))
            showSuccess('Table deleted successfully!')
            break
        }
      } else {
        const errorData = await response.json()
        console.error(`Failed to delete ${type}:`, errorData.message)
        alert(`Failed to delete ${type}: ${errorData.message}`)
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
      alert(`Failed to delete ${type}`)
    } finally {
      setShowDeleteConfirm({show: false, type: '', id: 0, name: ''})
    }
  }

  const handleGenerateQR = (tableId: number) => {
    const url = `${window.location.origin}/ordering?restaurantId=${session?.user?.restaurantId}&tableId=${tableId}`
    // Create QR code URL using a QR code service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    
    // Open QR code in new window
    const newWindow = window.open('', '_blank', 'width=400,height=400')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>QR Code for Table</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
            <h2>QR Code for Table</h2>
            <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px;">
            <p style="text-align: center; margin-top: 10px; font-size: 12px; word-break: break-all;">${url}</p>
            <button onclick="window.print()" style="margin-top: 10px; padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Print QR Code</button>
          </body>
        </html>
      `)
    }
  }

  const truncateText = (text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <SessionRestaurantLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </SessionRestaurantLayout>
    )
  }

  if (error || !restaurant) {
    return (
      <SessionRestaurantLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error || 'Restaurant not found'}</p>
        </div>
      </SessionRestaurantLayout>
    )
  }

  const restaurantId = session?.user?.restaurantId

  return (
    <SessionRestaurantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{restaurant.name} Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your restaurant</p>
          </div>
        </div>

        {/* Restaurant Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restaurant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Email:</strong> {restaurant.email}</p>
              <p><strong>Phone:</strong> {restaurant.phone}</p>
              <p><strong>Address:</strong> {restaurant.address}</p>
              {restaurant.summary && (
                <p><strong>Summary:</strong> {restaurant.summary}</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/manage/orders`}>
                  Manage Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={tables.length > 0 ? `/ordering?restaurantId=${restaurantId}&tableId=${tables[0].id}` : `/restaurant/edit`}>
                  {tables.length > 0 ? 'Preview Ordering Interface' : 'Add Tables First'}
                </Link>
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setShowProfileModal(true)}
              >
                Edit Restaurant
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dish Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Dish Categories</CardTitle>
              <CardDescription>Manage your menu categories</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowCategoryModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </CardHeader>
          <CardContent>
            {dishCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No categories found. Add your first category to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dishCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.category_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('category', category.id, category.category_name)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Customisation Options */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Customisation Options</CardTitle>
              <CardDescription>Manage dish customization options</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowOptionModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Option
            </Button>
          </CardHeader>
          <CardContent>
            {customisationOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No customisation options found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Option</TableHead>
                    <TableHead>Available Values (Extra Price)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customisationOptions.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell>{option.option_name}</TableCell>
                      <TableCell>
                        {option.optionValues?.map(value => 
                          `${value.value_name} (+$${value.extra_price})`
                        ).join(', ') || 'No values'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditOption(option)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('option', option.id, option.option_name)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dishes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Dishes</CardTitle>
              <CardDescription>Manage your menu items</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowDishModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Dish
            </Button>
          </CardHeader>
          <CardContent>
            {dishes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No dishes found. Add dishes to build your menu.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Dish Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Available Options</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dishes.map((dish) => (
                    <TableRow key={dish.id}>
                      <TableCell>{dish.category?.category_name}</TableCell>
                      <TableCell>{dish.dish_name}</TableCell>
                      <TableCell>{truncateText(dish.description)}</TableCell>
                      <TableCell>${dish.base_price}</TableCell>
                      <TableCell>
                        {dish.availableOptions?.map(opt => opt.option?.option_name).join(', ') || 'None'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDish(dish)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('dish', dish.id, dish.dish_name)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Tables */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Tables</CardTitle>
              <CardDescription>Manage restaurant tables</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowTableModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Table
            </Button>
          </CardHeader>
          <CardContent>
            {tables.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tables found. Add tables to enable customer ordering.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell>{table.table_number}</TableCell>
                      <TableCell>{table.capacity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleGenerateQR(table.id)}>QR Code</Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditTable(table)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('table', table.id, table.table_number)}>Delete</Button>
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

      {/* Modals */}
      <CategoryModal 
        isOpen={showCategoryModal} 
        onClose={() => {
          setShowCategoryModal(false)
          setEditingCategory(null)
        }}
        onSubmit={handleAddCategory}
        category={editingCategory}
      />
      <OptionModal 
        isOpen={showOptionModal} 
        onClose={() => {
          setShowOptionModal(false)
          setEditingOption(null)
        }}
        onSubmit={handleAddOption}
        option={editingOption}
      />
      <DishModal 
        isOpen={showDishModal} 
        onClose={() => {
          setShowDishModal(false)
          setEditingDish(null)
        }}
        onSubmit={handleAddDish}
        categories={dishCategories}
        options={customisationOptions}
        dish={editingDish}
      />
      <TableModal 
        isOpen={showTableModal} 
        onClose={() => {
          setShowTableModal(false)
          setEditingTable(null)
        }}
        onSubmit={handleAddTable}
        table={editingTable}
      />
      <RestaurantProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleUpdateProfile}
        restaurant={restaurant}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-red-600 mb-4">Confirm Delete</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm({show: false, type: '', id: 0, name: ''})}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
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
    </SessionRestaurantLayout>
  )
}