'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { RestaurantLayout } from '@/components/layout/restaurant-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
      setName(category.categoryName || '')
    } else {
      setName('')
    }
  }, [category, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (category) {
      onSubmit({ categoryId: category.id, categoryName: name })
    } else {
      onSubmit({ categoryName: name })
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
  const [values, setValues] = useState([{ valueName: '', extraPrice: 0 }])

  useEffect(() => {
    if (option) {
      setOptionName(option.optionName || '')
      setValues(option.optionValues?.length ? option.optionValues.map(v => ({ valueName: v.valueName, extraPrice: v.extraPrice })) : [{ valueName: '', extraPrice: 0 }])
    } else {
      setOptionName('')
      setValues([{ valueName: '', extraPrice: 0 }])
    }
  }, [option, isOpen])

  if (!isOpen) return null

  const addValue = () => {
    setValues([...values, { valueName: '', extraPrice: 0 }])
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
      optionName, 
      values: values.filter(v => v.valueName) 
    }
    if (option) {
      data.optionId = option.id
    }
    onSubmit(data)
    setOptionName('')
    setValues([{ valueName: '', extraPrice: 0 }])
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
                      value={value.valueName}
                      onChange={(e) => updateValue(index, 'valueName', e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Extra price"
                      value={value.extraPrice}
                      onChange={(e) => updateValue(index, 'extraPrice', parseFloat(e.target.value) || 0)}
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
        dishName: dish.dishName || '',
        description: dish.description || '',
        basePrice: dish.basePrice || 0,
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
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
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
                      <span className="dark:text-gray-300">{option.optionName}</span>
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
        tableNumber: table.tableNumber || '',
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
  const params = useParams()
  const restaurantId = parseInt(params.id as string)
  
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
  const [editingCategory, setEditingCategory] = useState<DishCategory | null>(null)
  const [editingOption, setEditingOption] = useState<CustomisationOption | null>(null)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, type: string, id: number, name: string}>({show: false, type: '', id: 0, name: ''})
  const [showSuccessMessage, setShowSuccessMessage] = useState<{show: boolean, message: string}>({show: false, message: ''})

  useEffect(() => {
    fetchRestaurantData()
  }, [restaurantId])

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [restaurantRes, categoriesRes, optionsRes, dishesRes, tablesRes] = await Promise.all([
        fetch(`/api/restaurants/${restaurantId}`),
        fetch(`/api/restaurants/${restaurantId}/categories`),
        fetch(`/api/restaurants/${restaurantId}/customisation-options`),
        fetch(`/api/restaurants/${restaurantId}/dishes`),
        fetch(`/api/restaurants/${restaurantId}/tables`)
      ])

      const [restaurantData, categoriesData, optionsData, dishesData, tablesData] = await Promise.all([
        restaurantRes.json(),
        categoriesRes.json(),
        optionsRes.json(),
        dishesRes.json(),
        tablesRes.json()
      ])

      if (restaurantData.status === 200) setRestaurant(restaurantData.data)
      if (categoriesData.status === 200) setDishCategories(categoriesData.data)
      if (optionsData.status === 200) setCustomisationOptions(optionsData.data)
      if (dishesData.status === 200) setDishes(dishesData.data)
      if (tablesData.status === 200) setTables(tablesData.data)
      
    } catch (error) {
      setError('Failed to fetch restaurant data')
    } finally {
      setLoading(false)
    }
  }

  // Handle functions
  const handleAddCategory = async (data: any) => {
    try {
      const url = `/api/restaurants/${restaurantId}/categories`
      const method = data.categoryId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (data.categoryId) {
          setDishCategories(categories => 
            categories.map(cat => 
              cat.id === data.categoryId 
                ? { ...cat, categoryName: data.categoryName }
                : cat
            )
          )
          showSuccess('Category updated successfully!')
        } else {
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
      const url = `/api/restaurants/${restaurantId}/customisation-options`
      const method = data.optionId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (data.optionId) {
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

  const handleEditOption = (option: CustomisationOption) => {
    setEditingOption(option)
    setShowOptionModal(true)
  }

  const handleAddDish = async (data: any) => {
    try {
      const url = `/api/restaurants/${restaurantId}/dishes`
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
          const dishWithCategory = {
            ...result.data,
            category: { id: category?.id, categoryName: category?.categoryName }
          }
          setDishes(dishes => 
            dishes.map(dish => 
              dish.id === data.dishId ? dishWithCategory : dish
            )
          )
          showSuccess('Dish updated successfully!')
        } else {
          const dishWithCategory = {
            ...result.data,
            category: { id: category?.id, categoryName: category?.categoryName }
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

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish)
    setShowDishModal(true)
  }

  const handleAddTable = async (data: any) => {
    try {
      const url = `/api/restaurants/${restaurantId}/tables`
      const method = data.tableId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (data.tableId) {
          setTables(tables => 
            tables.map(table => 
              table.id === data.tableId ? result.data : table
            )
          )
          showSuccess('Table updated successfully!')
        } else {
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
      
      const response = await fetch(`/api/restaurants/${restaurantId}/${endpoints[type as keyof typeof endpoints]}?${params[type as keyof typeof params]}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
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
    const url = `${window.location.origin}/ordering?restaurantId=${restaurantId}&tableId=${tableId}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    
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

  const showSuccess = (message: string) => {
    setShowSuccessMessage({show: true, message})
    setTimeout(() => {
      setShowSuccessMessage({show: false, message: ''})
    }, 3000)
  }

  const truncateText = (text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </RestaurantLayout>
    )
  }

  if (error || !restaurant) {
    return (
      <RestaurantLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-muted-foreground mt-2">{error || 'Restaurant not found'}</p>
        </div>
      </RestaurantLayout>
    )
  }

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Overview of {restaurant.name}</h1>
            <p className="text-muted-foreground">Restaurant Management Dashboard</p>
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

          {/* Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/manage/orders?restaurantId=${restaurantId}`}>
                  Manage Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={tables.length > 0 ? `/ordering?restaurantId=${restaurantId}&tableId=${tables[0].id}` : `/restaurant/${restaurantId}/edit`}>
                  {tables.length > 0 ? 'Preview Ordering Interface' : 'Add Tables First'}
                </Link>
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
              <div className="text-center py-8 text-muted-foreground">
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
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('category', category.id, category.categoryName)}>Delete</Button>
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
              <div className="text-center py-8 text-muted-foreground">
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
                      <TableCell>{option.optionName}</TableCell>
                      <TableCell>
                        {option.optionValues?.map(value => 
                          `${value.valueName} (+$${value.extraPrice})`
                        ).join(', ') || 'No values'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditOption(option)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('option', option.id, option.optionName)}>Delete</Button>
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
              <div className="text-center py-8 text-muted-foreground">
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
                      <TableCell>{dish.category?.categoryName}</TableCell>
                      <TableCell>{dish.dishName}</TableCell>
                      <TableCell>{truncateText(dish.description)}</TableCell>
                      <TableCell>A${dish.basePrice}</TableCell>
                      <TableCell>
                        {dish.availableOptions?.map(opt => opt.option.optionName).join(', ') || 'None'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDish(dish)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('dish', dish.id, dish.dishName)}>Delete</Button>
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
              <div className="text-center py-8 text-muted-foreground">
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
                      <TableCell>{table.tableNumber}</TableCell>
                      <TableCell>{table.capacity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleGenerateQR(table.id)}>QR Code</Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditTable(table)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirm('table', table.id, table.tableNumber)}>Delete</Button>
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
    </RestaurantLayout>
  )
}