'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from './navbar'

interface RestaurantLayoutProps {
  children: React.ReactNode
}

export function RestaurantLayout({ children }: RestaurantLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const restaurantId = parseInt(params.id as string)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Only admins can access /restaurant/[id] routes
    if (!session.user.isAdmin) {
      router.push('/restaurant') // Redirect non-admins to their own dashboard
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

  if (!session || !session.user.isAdmin) {
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