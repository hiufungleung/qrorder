'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from './navbar'

interface SessionRestaurantLayoutProps {
  children: React.ReactNode
}

export function SessionRestaurantLayout({ children }: SessionRestaurantLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const adminRestaurantId = searchParams.get('restaurantId')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Non-admin users need their own restaurant ID
    if (!session.user.isAdmin && !session.user.restaurantId) {
      router.push('/auth/login?error=no-restaurant')
      return
    }

    // Admin users can access via URL parameter or their own restaurant ID
    if (session.user.isAdmin) {
      if (!session.user.restaurantId && !adminRestaurantId) {
        router.push('/admin')
        return
      }
    }
  }, [session, status, router, adminRestaurantId])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Allow access if user has restaurant ID OR is admin with URL parameter
  const hasAccess = session?.user?.restaurantId || (session?.user?.isAdmin && adminRestaurantId)
  
  if (!session || !hasAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}