'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useShoppingCart } from '@/hooks/useShoppingCart'
import { MenuCategory, MenuDish, MenuCustomisationOption, Restaurant } from '@/types'
import { ShoppingCart, Menu, X } from 'lucide-react'

interface OrderModalProps {
  dish: MenuDish | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (dishId: number, dishName: string, quantity: number, selectedValues: { id: number, name: string, price: number }[]) => void
}

function OrderModal({ dish, isOpen, onClose, onAddToCart }: OrderModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({})
  const [modalPrice, setModalPrice] = useState(0)

  useEffect(() => {
    if (dish) {
      // Set default values (prefer "Regular" options)
      const defaultValues: Record<number, number> = {}
      dish.availableOptions.forEach(option => {
        const regularValue = option.values.find(v => v.value_name.includes('Regular'))
        const defaultValue = regularValue || option.values[0]
        if (defaultValue) {
          defaultValues[option.id] = defaultValue.id
        }
      })
      setSelectedValues(defaultValues)
      calculatePrice(defaultValues, quantity, dish)
    }
  }, [dish])

  useEffect(() => {
    if (dish) {
      calculatePrice(selectedValues, quantity, dish)
    }
  }, [selectedValues, quantity, dish])

  const calculatePrice = (values: Record<number, number>, qty: number, currentDish: MenuDish) => {
    let totalPrice = currentDish.base_price

    // Add extra prices from selected options
    Object.values(values).forEach(valueId => {
      currentDish.availableOptions.forEach(option => {
        const selectedValue = option.values.find(v => v.id === valueId)
        if (selectedValue) {
          totalPrice += selectedValue.extra_price
        }
      })
    })

    setModalPrice(totalPrice * qty)
  }

  const handleAddToCart = () => {
    if (!dish) return

    const selectedValueDetails = Object.values(selectedValues).map(valueId => {
      for (const option of dish.availableOptions) {
        const value = option.values.find(v => v.id === valueId)
        if (value) {
          return {
            id: value.id,
            name: value.value_name,
            price: value.extra_price,
          }
        }
      }
      return null
    }).filter(Boolean) as { id: number, name: string, price: number }[]

    onAddToCart(dish.id, dish.dish_name, quantity, selectedValueDetails)
    onClose()
    setQuantity(1)
  }

  if (!isOpen || !dish) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{dish.dish_name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">{dish.description}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Customisation Options */}
          {dish.availableOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium dark:text-white">Customisation Options</h3>
              {dish.availableOptions.map(option => (
                <div key={option.id} className="space-y-2">
                  <label className="block text-sm font-medium dark:text-gray-300">{option.option_name}</label>
                  <select
                    value={selectedValues[option.id] || ''}
                    onChange={(e) => setSelectedValues(prev => ({
                      ...prev,
                      [option.id]: parseInt(e.target.value)
                    }))}
                    className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {option.values.map(value => (
                      <option key={value.id} value={value.id}>
                        {value.value_name} (+A${value.extra_price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium dark:text-gray-300">Quantity</label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-12 w-12"
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-lg text-gray-900 dark:text-white"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold dark:text-white">Total: A${modalPrice.toFixed(2)}</span>
          </div>
          <Button onClick={handleAddToCart} className="w-full h-12 text-base">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}

function ShoppingCartModal({ isOpen, onClose, cart, updateQuantity, removeFromCart, onCheckout }: {
  isOpen: boolean
  onClose: () => void
  cart: any
  updateQuantity: (index: number, quantity: number) => void
  removeFromCart: (index: number) => void
  onCheckout: () => void
}) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Shopping Cart</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cart.items.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item: any, index: number) => (
                <div key={index} className="border-b dark:border-gray-700 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium dark:text-white">{item.dishName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.selectedValuesName
                          .filter((name: string) => !name.includes('Regular'))
                          .join(', ')}
                      </p>
                      <p className="text-sm font-medium dark:text-gray-300 mt-1">A${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm dark:text-white">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(index)}
                    className="mt-2 w-full"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="p-4 sm:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold dark:text-white">Total: A${cart.totalPrice.toFixed(2)}</span>
            </div>
            <Button onClick={onCheckout} className="w-full h-12 text-base">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutModal({ isOpen, onClose, cart, restaurantId, tableId, onOrderComplete }: {
  isOpen: boolean
  onClose: () => void
  cart: any
  restaurantId: number
  tableId: number
  onOrderComplete: (orderData: any) => void
}) {
  const [customerName, setCustomerName] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName.trim()) {
      alert('Please enter your name')
      return
    }

    if (cart.items.length === 0) {
      alert('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare dishes data for API
      const dishes = cart.items.map((item: any) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        selectedValuesId: item.selectedValuesId
      }))

      const orderData = {
        restaurantId,
        tableId,
        customerName: customerName.trim(),
        comment: comment.trim() || null,
        dishes
      }

      const response = await fetch('/api/public/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (response.ok && result.status === 200) {
        onOrderComplete(result.data)
        onClose()
        // Reset form
        setCustomerName('')
        setComment('')
      } else {
        throw new Error(result.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error instanceof Error ? error.message : 'Failed to create order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={(e) => {
        if (!isSubmitting) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Checkout</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="font-medium dark:text-white mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {cart.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.quantity}x {item.dishName}
                      {item.selectedValuesName.filter((name: string) => !name.includes('Regular')).length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {' '}({item.selectedValuesName.filter((name: string) => !name.includes('Regular')).join(', ')})
                        </span>
                      )}
                    </span>
                    <span className="font-medium dark:text-white">A${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-bold">
                  <span className="dark:text-white">Total</span>
                  <span className="text-primary">A${cart.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  disabled={isSubmitting}
                  className="w-full text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any special requests, allergies, or notes for the kitchen..."
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !customerName.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - A$${cart.totalPrice.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderSuccessModal({ isOpen, orderData, onClose }: {
  isOpen: boolean
  orderData: any
  onClose: () => void
}) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, countdown])

  useEffect(() => {
    if (isOpen) {
      setCountdown(3)
    }
  }, [isOpen])

  if (!isOpen || !orderData) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 text-center animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Order Placed Successfully!
        </h2>
        
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          <p className="text-lg font-semibold text-primary mb-1">
            Order #{orderData.orderNumber}
          </p>
          <p className="text-sm">
            Total: A${orderData.totalPrice.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Redirecting to order status in {countdown} seconds...
          </p>
        </div>

        <Button 
          onClick={onClose}
          className="w-full"
          variant="outline"
        >
          Close
        </Button>
      </div>
    </div>
  )
}

export default function OrderingPage() {
  const searchParams = useSearchParams()
  const restaurantId = parseInt(searchParams.get('restaurantId') || '1')
  const tableId = parseInt(searchParams.get('tableId') || '1')
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDish, setSelectedDish] = useState<MenuDish | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getItemCount } = useShoppingCart()

  useEffect(() => {
    fetchMenu()
  }, [restaurantId])

  // Scroll listener to update active category based on current position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200 // Offset to account for sticky header
      let currentActiveCategory = null

      // Find which category is currently in view
      for (const category of categories) {
        const element = document.getElementById(`category-${category.id}`)
        if (element) {
          const elementTop = element.offsetTop
          const elementBottom = elementTop + element.offsetHeight
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            currentActiveCategory = category.id
            break
          }
        }
      }

      // If no category is fully in view, find the closest one
      if (!currentActiveCategory && categories.length > 0) {
        let closestCategory = categories[0].id
        let closestDistance = Infinity

        for (const category of categories) {
          const element = document.getElementById(`category-${category.id}`)
          if (element) {
            const distance = Math.abs(element.offsetTop - scrollPosition)
            if (distance < closestDistance) {
              closestDistance = distance
              closestCategory = category.id
            }
          }
        }
        currentActiveCategory = closestCategory
      }

      if (currentActiveCategory && currentActiveCategory !== activeCategory) {
        setActiveCategory(currentActiveCategory)
      }
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Call once on mount to set initial active category
    handleScroll()

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [categories, activeCategory])

  // Auto-scroll active category into view on mobile
  useEffect(() => {
    if (activeCategory) {
      const activeButton = document.querySelector(`[data-category-id="${activeCategory}"]`)
      const navContainer = document.querySelector('.category-nav-container')
      
      if (activeButton && navContainer) {
        const containerRect = navContainer.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        
        // Check if button is outside the visible area
        if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
          // Scroll the button into the center of the container
          const scrollLeft = activeButton.offsetLeft - navContainer.offsetWidth / 2 + activeButton.offsetWidth / 2
          navContainer.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          })
        }
      }
    }
  }, [activeCategory])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/menu/${restaurantId}`)
      const data = await response.json()
      
      if (data.status === 200) {
        setRestaurant(data.data.restaurant)
        setCategories(data.data.categories)
        if (data.data.categories.length > 0) {
          setActiveCategory(data.data.categories[0].id)
        }
      } else {
        setError(data.message || 'Failed to fetch menu')
      }
    } catch (error) {
      setError('Failed to fetch menu')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (
    dishId: number, 
    dishName: string, 
    quantity: number, 
    selectedValues: { id: number, name: string, price: number }[]
  ) => {
    // Calculate unit price
    const dish = categories.flatMap(cat => cat.dishes).find(d => d.id === dishId)
    if (!dish) return

    const unitPrice = dish.base_price + selectedValues.reduce((sum, val) => sum + val.price, 0)

    const cartItem = {
      dishId,
      dishName,
      quantity,
      unitPrice,
      selectedValuesId: selectedValues.map(v => v.id),
      selectedValuesName: selectedValues.map(v => v.name),
    }

    addToCart(cartItem)
  }

  const handleCheckout = () => {
    setShowCart(false)
    setShowCheckout(true)
  }

  const handleOrderComplete = (completedOrderData: any) => {
    // Clear the cart
    clearCart()
    
    // Store order data and show success popup
    setOrderData(completedOrderData)
    setShowOrderSuccess(true)
    
    // Close checkout modal
    setShowCheckout(false)
    
    // Redirect to order status page after 3 seconds
    setTimeout(() => {
      window.location.href = `/order-status?restaurantId=${restaurantId}&orderNumber=${completedOrderData.orderNumber}`
    }, 3000)
  }

  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setActiveCategory(categoryId)
    setShowSidebar(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{error || 'Restaurant not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-optimized Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 sm:container sm:mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden bg-transparent border-none cursor-pointer p-2 relative z-[101] w-11 h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                data-toggle={showSidebar ? "open" : "closed"}
                aria-haspopup="true"
                aria-expanded={showSidebar}
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <span className="sr-only">Toggle navigation menu</span>
                <div className="relative w-6 h-4 flex flex-col justify-between">
                  <span className={`block h-0.5 w-full bg-current transition-all duration-300 ease-in-out transform-gpu ${
                    showSidebar 
                      ? 'rotate-45 translate-y-[7px]' 
                      : 'rotate-0 translate-y-0'
                  }`} />
                  <span className={`block h-0.5 w-full bg-current transition-all duration-300 ease-in-out transform-gpu ${
                    showSidebar 
                      ? 'opacity-0 scale-x-0' 
                      : 'opacity-100 scale-x-100'
                  }`} />
                  <span className={`block h-0.5 w-full bg-current transition-all duration-300 ease-in-out transform-gpu ${
                    showSidebar 
                      ? '-rotate-45 -translate-y-[7px]' 
                      : 'rotate-0 translate-y-0'
                  }`} />
                </div>
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold dark:text-white line-clamp-1">{restaurant.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Table {tableId}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Category Navigation */}
      <div className="lg:hidden sticky top-14 sm:top-16 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-4 py-2 overflow-x-auto category-nav-container">
          <div className="flex gap-2 whitespace-nowrap">
            {categories.map(category => (
              <button
                key={category.id}
                data-category-id={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {category.category_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sm:container sm:mx-auto px-4 py-4 sm:py-6 lg:flex lg:gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-4 dark:text-white">Categories</h3>
          <nav className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`w-full text-left py-2 px-3 text-sm rounded-md transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {category.category_name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
            <div className="fixed top-[calc(3.5rem-1px)] sm:top-[calc(4rem-1px)] left-0 h-[calc(100vh-3.5rem+1px)] sm:h-[calc(100vh-4rem+1px)] w-64 bg-white dark:bg-gray-800 shadow-xl animate-slide-in overflow-y-auto">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-lg dark:text-white">Categories</h3>
                </div>
                <nav className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => scrollToCategory(category.id)}
                      className={`w-full text-left py-3 px-3 text-sm rounded-md transition-colors ${
                        activeCategory === category.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category.category_name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Menu Content */}
        <div className="flex-1 space-y-6 sm:space-y-8 pb-20">
          {categories.map(category => (
            <div key={category.id} id={`category-${category.id}`} className="scroll-mt-32 sm:scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 dark:text-white">{category.category_name}</h2>
              <div className="grid gap-3 sm:gap-4">
                {category.dishes.map(dish => (
                  <Card key={dish.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDish(dish)}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-base sm:text-lg mb-1 sm:mb-2">{dish.dish_name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">{dish.description}</CardDescription>
                          <p className="text-base sm:text-lg font-semibold text-primary">
                            A${dish.base_price.toFixed(2)}+
                          </p>
                        </div>
                        <Button size="sm" className="shrink-0">
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-optimized Fixed footer with cart info */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-3 sm:p-4 z-30">
          <div className="sm:container sm:mx-auto flex items-center justify-between gap-3">
            <span className="text-base sm:text-lg font-semibold dark:text-white">
              Total: A${cart.totalPrice.toFixed(2)}
            </span>
            <Button onClick={handleCheckout} size="sm" className="text-base">
              Send Order ({getItemCount()})
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <OrderModal
        dish={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleAddToCart}
      />

      <ShoppingCartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        restaurantId={restaurantId}
        tableId={tableId}
        onOrderComplete={handleOrderComplete}
      />

      <OrderSuccessModal
        isOpen={showOrderSuccess}
        orderData={orderData}
        onClose={() => setShowOrderSuccess(false)}
      />

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @keyframes scale-up {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}