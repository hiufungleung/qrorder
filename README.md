# QR Order - Next.js Restaurant Management System

A modern, full-stack restaurant ordering system with QR code menus, built with Next.js, TypeScript, Prisma, and TailwindCSS.

🌐 **Live Demo**: [https://qrorder.hiufungleung.uk](https://qrorder.hiufungleung.uk)

## 🚀 Features

- **QR Code Menus** - Customers scan QR codes to access digital menus instantly
- **Real-time Ordering** - Interactive shopping cart with extensive customization options
- **Order Management Dashboard** - Complete restaurant dashboard for managing orders and menu items
- **Multi-Restaurant Admin Panel** - Super admin interface for managing multiple restaurant locations
- **Dark/Light Mode** - Full theme switching with system preference detection
- **Mobile-First Design** - Responsive design optimized for all devices and screen sizes
- **Type Safety** - Complete TypeScript implementation with strict type checking
- **Real-time Updates** - Auto-refreshing order status and live order management
- **Self-Registration** - Restaurant owners can register and manage their own establishments
- **Printable QR Codes** - Generate and print table-specific QR codes
- **Order Status Tracking** - Real-time order tracking for customers

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.2, React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components, Lucide React icons
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider and session management
- **State Management**: React hooks + localStorage for cart persistence
- **Deployment**: Docker containerization support

## 📊 Database Schema

The system uses a comprehensive relational database schema designed for scalability:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/hiufungleung/qrorder/blob/main/readme/de_schema_dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/hiufungleung/qrorder/blob/main/readme/de_schema.svg" />
</picture>

### Core Entities:
- **Restaurants** - Multi-tenant restaurant management with admin privileges
- **Tables** - Table management with QR code generation
- **Categories & Dishes** - Hierarchical menu organization with pricing
- **Customization Options** - Flexible option system (temperature, milk types, etc.)
- **Orders & Order Details** - Complete order lifecycle management
- **Junction Tables** - Many-to-many relationships for dish options and customizations

## 📋 Prerequisites

- Node.js 18+ and pnpm package manager
- PostgreSQL database (local or cloud)
- Git for version control

## ⚙️ Setup Instructions

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd qrorder
pnpm install
```

2. **Set up environment variables:**
```bash
# Create .env file with your database credentials:
DATABASE_URL="postgresql://username:password@localhost:5432/qrorder"
NEXTAUTH_SECRET="your-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Set up database:**
```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database (creates tables)
pnpm prisma db push

# Or run migrations for production
# pnpm prisma migrate deploy
```

4. **Start development server:**
```bash
pnpm dev
```

Visit `http://localhost:3000`

## 📱 Usage Guide

### 👨‍💼 Admin Access
- Login with admin credentials to access the admin panel
- Manage multiple restaurants from a central dashboard
- Create, edit, and delete restaurant accounts
- Monitor system-wide analytics and performance

### 🍽️ Restaurant Management
- Register your restaurant or login with restaurant credentials
- **Menu Management**: Create categories, add dishes with descriptions and pricing
- **Customization Options**: Set up drink temperatures, milk alternatives, portion sizes
- **Table Management**: Add tables with capacity and generate printable QR codes
- **Order Processing**: View incoming orders, update status (Pending → Making → Completed)
- **Real-time Dashboard**: Monitor active orders and restaurant performance

### 👥 Customer Ordering Experience
- Scan table QR code or visit `/ordering?restaurantId=1&tableId=1`
- Browse organized menu categories with rich descriptions
- Customize orders with available options (temperature, extras, special instructions)
- Add multiple items to cart with quantities
- Review order summary and place order
- Track order status in real-time at `/order-status`

## 🌐 Key Application Routes

- `/` - Landing page with system overview
- `/auth/login` - Unified authentication for restaurants and admins
- `/auth/signup` - Self-service restaurant registration
- `/admin` - Admin dashboard for system management
- `/restaurant/[id]` - Restaurant management dashboard
- `/restaurant/[id]/orders` - Real-time order management interface
- `/ordering?restaurantId=X&tableId=Y` - Customer ordering interface
- `/order-status?restaurantId=X&orderNumber=Y` - Order tracking page

## 🎨 Design System

- **Theme Support**: Automatic dark/light mode with system preference detection
- **Component Library**: Built on shadcn/ui with consistent design tokens
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🔧 Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint (if configured)
pnpm typecheck              # Run TypeScript checks (if configured)

# Database Management
pnpm prisma generate        # Regenerate Prisma client
pnpm prisma studio          # Open Prisma Studio GUI
pnpm prisma migrate dev     # Create and apply new migration
pnpm prisma db push         # Push schema changes (development)
pnpm prisma migrate reset   # Reset database (⚠️ destroys data)
```

## 🐳 Docker Support

The application includes Docker configuration for easy deployment:

```bash
# Build and run with Docker
docker build -t qrorder .
docker run -p 3000:3000 qrorder

# Or use Docker Compose (if docker-compose.yml exists)
docker-compose up -d
```

## 🚀 Deployment

The application is production-ready and deployed at [qrorder.hiufungleung.uk](https://qrorder.hiufungleung.uk).

### Environment Variables for Production:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 📈 Performance Features

- **Server-Side Rendering** - Fast initial page loads with Next.js SSR
- **Static Generation** - Pre-built pages where applicable
- **Image Optimization** - Automatic image optimization with Next.js Image component
- **Database Optimization** - Efficient queries with Prisma and connection pooling
- **Caching Strategy** - Strategic use of browser and server-side caching

## 🔒 Security Features

- **Authentication** - Secure session-based authentication with NextAuth.js
- **Authorization** - Role-based access control (Admin vs Restaurant)
- **Data Validation** - Input validation and sanitization throughout
- **SQL Injection Protection** - Prisma ORM prevents SQL injection attacks
- **CSRF Protection** - Built-in CSRF protection with NextAuth.js

## 📝 Migration from CodeIgniter

This Next.js application is a complete modernization of the original CodeIgniter PHP application:

### Key Improvements:
- **Modern React Architecture** - Component-based UI instead of server-side PHP templates
- **Full Type Safety** - TypeScript throughout the entire application stack
- **Enhanced Mobile Experience** - Touch-optimized interface with responsive design
- **Real-time Capabilities** - Live updates without page refreshes
- **Better Security** - Modern authentication and authorization patterns
- **Developer Experience** - Hot reload, better debugging, and modern tooling
- **Performance** - Faster load times with modern bundling and optimization

### Database Compatibility:
The database schema maintains compatibility with existing data, allowing for seamless migration from the legacy PHP system.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js and modern web technologies**
