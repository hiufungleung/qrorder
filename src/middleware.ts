import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.isAdmin === true
    const restaurantId = token?.restaurantId

    // Admin routes - only accessible to admin users
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!isAdmin) {
        const redirectUrl = restaurantId 
          ? `/restaurant/${restaurantId}` 
          : '/auth/login'
        return NextResponse.redirect(new URL(redirectUrl, req.url))
      }
    }

    // Restaurant routes - check access permissions
    if (req.nextUrl.pathname.startsWith("/restaurant/")) {
      const pathRestaurantId = parseInt(
        req.nextUrl.pathname.split("/")[2]
      )
      
      // Non-admin users can only access their own restaurant
      if (!isAdmin && restaurantId !== pathRestaurantId) {
        const redirectUrl = restaurantId 
          ? `/restaurant/${restaurantId}` 
          : '/auth/login'
        return NextResponse.redirect(new URL(redirectUrl, req.url))
      }
    }

    // Management routes - accessible to authenticated users (admins can access via query params)
    if (req.nextUrl.pathname.startsWith("/manage/")) {
      // Admin users can access any restaurant's management via query params
      // Non-admin users can only access their own restaurant's management
      const queryRestaurantId = req.nextUrl.searchParams.get('restaurantId')
      
      if (!isAdmin && queryRestaurantId && parseInt(queryRestaurantId) !== restaurantId) {
        const redirectUrl = restaurantId 
          ? `/restaurant/${restaurantId}` 
          : '/restaurant'
        return NextResponse.redirect(new URL(redirectUrl, req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        if (
          req.nextUrl.pathname.startsWith("/admin") ||
          req.nextUrl.pathname.startsWith("/restaurant") ||
          req.nextUrl.pathname.startsWith("/manage")
        ) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/restaurant/:path*", "/manage/:path*"]
}