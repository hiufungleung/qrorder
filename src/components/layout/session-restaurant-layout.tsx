'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from './navbar'

interface SessionRestaurantLayoutProps {
  children: React.ReactNode
}

export function SessionRestaurantLayout({ children }: SessionRestaurantLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Both admins and non-admins need a restaurant ID to access restaurant pages
    if (!session.user.restaurantId) {
      if (session.user.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/auth/login?error=no-restaurant')
      }
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || !session.user.restaurantId) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}