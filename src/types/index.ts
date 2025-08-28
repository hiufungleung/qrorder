import { OrderStatus } from '@prisma/client'

export interface Restaurant {
  restaurant_id: number
  name: string
  email: string
  phone: string
  address: string
  is_admin: boolean
  summary?: string
}

export interface DishCategory {
  id: number
  restaurant_id: number
  category_name: string
  restaurant?: Restaurant
  dishes?: Dish[]
}

export interface Dish {
  id: number
  category_id: number
  dish_name: string
  description: string
  base_price: number
  category?: DishCategory
  availableOptions?: DishAvailableOption[]
}

export interface CustomisationOption {
  id: number
  option_name: string
  restaurant_id: number
  restaurant?: Restaurant
  optionValues?: OptionValue[]
  dishOptions?: DishAvailableOption[]
}

export interface OptionValue {
  id: number
  option_id: number
  value_name: string
  extra_price: number
  option?: CustomisationOption
}

export interface DishAvailableOption {
  dish_id: number
  option_id: number
  dish?: Dish
  option?: CustomisationOption
}

export interface Table {
  id: number
  restaurant_id: number
  table_number: string
  capacity: number
  restaurant?: Restaurant
}

export interface Order {
  id: number
  restaurant_id: number
  order_number: number
  customer_name: string
  total_price: number
  order_time: Date
  table_id: number
  comment?: string
  status: OrderStatus
  restaurant?: Restaurant
  table?: Table
  orderDetails?: OrderDetail[]
}

export interface OrderDetail {
  id: number
  order_id: number
  dish_id: number
  quantity: number
  order?: Order
  dish?: Dish
  orderDetailCustomisationOptions?: OrderDetailCustomisationOption[]
}

export interface OrderDetailCustomisationOption {
  value_id: number
  order_detail_id: number
  value?: OptionValue
  orderDetail?: OrderDetail
}

// Shopping Cart Types (for client-side state)
export interface CartItem {
  dishId: number
  dishName: string
  quantity: number
  unitPrice: number
  selectedValuesId: number[]
  selectedValuesName: string[]
}

export interface ShoppingCart {
  items: CartItem[]
  totalPrice: number
}

// API Response Types
export interface ApiResponse<T> {
  status: number
  message: string
  data?: T
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RestaurantForm {
  name: string
  email: string
  phone: string
  address: string
  password: string
  isAdmin: boolean
  summary?: string
}

export interface DishCategoryForm {
  categoryName: string
  restaurantId: number
}

export interface CustomisationOptionForm {
  optionName: string
  restaurantId: number
  values: {
    valueName: string
    extraPrice: number
  }[]
}

export interface DishForm {
  dishName: string
  description: string
  basePrice: number
  categoryId: number
  availableOptionIds: number[]
}

export interface TableForm {
  tableNumber: string
  capacity: number
  restaurantId: number
}

export interface OrderForm {
  restaurantId: number
  tableId: number
  customerName: string
  comment?: string
  dishes: CartItem[]
}

// Menu Display Types (for customer ordering interface)
export interface MenuCategory {
  id: number
  category_name: string
  dishes: MenuDish[]
}

export interface MenuDish {
  id: number
  dish_name: string
  description: string
  base_price: number
  availableOptions: MenuCustomisationOption[]
}

export interface MenuCustomisationOption {
  id: number
  option_name: string
  values: MenuOptionValue[]
}

export interface MenuOptionValue {
  id: number
  value_name: string
  extra_price: number
}