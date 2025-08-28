# QR Order - Next.js

A modern restaurant ordering system with QR code menus, built with Next.js, TypeScript, Prisma, and TailwindCSS.

## 🚀 Features

- **QR Code Menus** - Customers scan QR codes to access digital menus
- **Real-time Ordering** - Interactive shopping cart with customization options
- **Order Management** - Restaurant dashboard for managing orders and menu
- **Admin Panel** - Super admin interface for managing multiple restaurants
- **Dark/Light Mode** - Full theme switching support
- **Mobile-First Design** - Responsive design optimized for all devices
- **Type Safety** - Full TypeScript implementation
- **Real-time Updates** - Auto-refreshing order status and management

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Icons**: Lucide React
- **State Management**: React hooks + localStorage for cart

## 📋 Prerequisites

- Node.js 18+ and pnpm
- MySQL database
- Git

## ⚙️ Setup Instructions

1. **Clone and install dependencies:**
```bash
cd qrorder
pnpm install
```

2. **Set up environment variables:**
```bash
# Update .env file with your database credentials:
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXTAUTH_SECRET="your-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Set up database:**
```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to existing MySQL database
pnpm prisma db push

# Or run migrations (if starting fresh)
# pnpm prisma migrate dev
```

4. **Start development server:**
```bash
pnpm dev
```

Visit `http://localhost:3000` (or the port shown in terminal)

## 📱 Usage

### Admin Access
- Login with admin credentials
- Manage multiple restaurants
- Create/edit/delete restaurants

### Restaurant Management
- Login with restaurant credentials  
- Manage menu categories, dishes, and customization options
- Handle incoming orders and update status
- Generate QR codes for tables

### Customer Ordering
- Scan QR code or visit `/ordering?restaurantId=1&tableId=1`
- Browse menu categories and dishes
- Customize orders (temperature, milk type, etc.)
- Add items to cart and place orders
- Track order status in real-time

## 🌐 Key Routes

- `/` - Landing page
- `/auth/login` - Authentication
- `/admin` - Admin dashboard
- `/restaurant/[id]` - Restaurant management
- `/restaurant/[id]/orders` - Order management
- `/ordering?restaurantId=1&tableId=1` - Customer ordering
- `/order-status?restaurantId=1&orderNumber=123` - Order tracking

## 🎨 Dark Mode

The application supports system-preference based dark/light mode switching with a toggle button available in the header.

## 📊 Database Schema

The Prisma schema mirrors the existing MySQL database structure:

- **Restaurants** - Restaurant information and admin status
- **Categories & Dishes** - Menu structure with pricing
- **Customization Options** - Drink temperature, milk types, etc.
- **Orders & Order Details** - Order management with status tracking
- **Tables** - Restaurant table management

## 🔧 Development

```bash
# Generate Prisma client after schema changes
pnpm prisma generate

# Reset database (careful - this deletes data!)
pnpm prisma migrate reset

# View database in Prisma Studio
pnpm prisma studio

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📝 Migration Notes

This Next.js application is a complete rewrite of the original CodeIgniter PHP application, featuring:

- **Modern React patterns** instead of jQuery
- **Type safety** throughout with TypeScript
- **Better mobile experience** with responsive design
- **Real-time capabilities** with auto-refreshing
- **Enhanced security** with proper authentication
- **Better developer experience** with modern tooling

The database structure remains the same, so existing data is compatible.
