'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-primary">
              QR Order
            </Link>
            
            {session && (
              <div className="flex items-center space-x-4">
                {session.user.isAdmin && (
                  <Link href="/admin" className="text-sm font-medium hover:text-primary">
                    Admin Panel
                  </Link>
                )}
                {!session.user.isAdmin && (
                  <Link 
                    href="/restaurant" 
                    className="text-sm font-medium hover:text-primary"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-4 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {session.user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}