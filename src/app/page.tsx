'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed, ShoppingCart, User, QrCode } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Wait for session to load
    
    if (session) {
      // Redirect signed-in users based on their role
      if (session.user.is_admin) {
        router.push('/admin')
      } else {
        router.push('/restaurant')
      }
    }
  }, [session, status, router])

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render main content if user is signed in (will redirect)
  if (session) {
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">QR Order</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Modern Restaurant Ordering Made Simple
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Transform your dining experience with QR code menus, seamless ordering, 
            and real-time order management. Perfect for restaurants of all sizes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Run a Modern Restaurant
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From QR code menus to order management, we&apos;ve got all the tools to streamline your operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <QrCode className="h-10 w-10 text-primary mb-4" />
              <CardTitle>QR Code Menus</CardTitle>
              <CardDescription>
                Customers scan QR codes to view digital menus on their phones. 
                No apps to download, no contact needed.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingCart className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Smart Ordering</CardTitle>
              <CardDescription>
                Interactive shopping cart with customization options, 
                real-time pricing, and instant order submission.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <UtensilsCrossed className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Real-time order tracking, status updates, and kitchen management 
                tools to keep everything organized.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 4 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <User className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Comprehensive restaurant management with menu editing, 
                table management, and detailed analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 5 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-bold mb-4">
                $
              </div>
              <CardTitle>Cost Effective</CardTitle>
              <CardDescription>
                Reduce printing costs, minimize staff workload, and improve 
                order accuracy with digital ordering.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 6 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-bold mb-4">
                📱
              </div>
              <CardTitle>Mobile First</CardTitle>
              <CardDescription>
                Optimized for mobile devices with responsive design and 
                intuitive user experience for all customers.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started with QR Order in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2 dark:text-white">Set Up Your Menu</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Create your digital menu with dishes, categories, and customization options
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2 dark:text-white">Generate QR Codes</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Print QR codes for each table that link directly to your menu
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2 dark:text-white">Start Taking Orders</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Customers scan, order, and you manage everything from your dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Modernize Your Restaurant?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join restaurants already using QR Order to improve their customer experience 
            and streamline operations.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/login">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <UtensilsCrossed className="h-6 w-6" />
              <span className="text-lg font-semibold">QR Order</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 QR Order. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
