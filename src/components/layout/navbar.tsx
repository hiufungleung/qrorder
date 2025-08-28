'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setShowSignOutConfirm(false)
    try {
      // Use redirect: false to handle navigation manually
      const result = await signOut({ 
        redirect: false,
        callbackUrl: '/'
      })
      
      // Force a hard navigation to ensure clean state
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

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
                  <Link href="/admin" className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary">
                    Admin Panel
                  </Link>
                )}
                {!session.user.isAdmin && (
                  <Link 
                    href="/restaurant" 
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary"
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
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {session.user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSigningOut}
                  onClick={() => setShowSignOutConfirm(true)}
                >
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
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

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSignOutConfirm(false)
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Sign Out
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to sign out? You will need to log in again to access your account.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}