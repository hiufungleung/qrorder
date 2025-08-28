import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.restaurants.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            isAdmin: user.is_admin,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin
        token.restaurantId = parseInt(user.id)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.isAdmin = token.isAdmin as boolean
        session.user.restaurantId = token.restaurantId as number
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
}

declare module "next-auth" {
  interface User {
    isAdmin: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin: boolean
      restaurantId: number
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin: boolean
    restaurantId: number
  }
}