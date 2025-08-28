'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/ui/theme-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="qrorder-theme"
    >
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}