'use client'

import { useState, useEffect } from 'react'
import { CartItem, ShoppingCart } from '@/types'

export function useShoppingCart() {
  const [cart, setCart] = useState<ShoppingCart>({
    items: [],
    totalPrice: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error('Failed to parse saved cart:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      // Check if item with same dish and customization already exists
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => 
          cartItem.dishId === item.dishId &&
          JSON.stringify(cartItem.selectedValuesId.sort()) === JSON.stringify(item.selectedValuesId.sort())
      )

      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = prevCart.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        )
      } else {
        // Add new item
        newItems = [...prevCart.items, item]
      }

      const totalPrice = calculateTotalPrice(newItems)
      
      return {
        items: newItems,
        totalPrice,
      }
    })
  }

  const removeFromCart = (index: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter((_, i) => i !== index)
      const totalPrice = calculateTotalPrice(newItems)
      
      return {
        items: newItems,
        totalPrice,
      }
    })
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map((item, i) =>
        i === index ? { ...item, quantity } : item
      )
      const totalPrice = calculateTotalPrice(newItems)
      
      return {
        items: newItems,
        totalPrice,
      }
    })
  }

  const clearCart = () => {
    setCart({
      items: [],
      totalPrice: 0,
    })
  }

  const calculateTotalPrice = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity)
    }, 0)
  }

  const getItemCount = (): number => {
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
  }
}