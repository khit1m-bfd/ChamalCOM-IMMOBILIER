'use client'

import React, { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/lib/stores/authStore'

interface ProvidersProps {
  children: React.ReactNode
  locale: string
}

export function Providers({ children, locale }: ProvidersProps) {
  const { initialize } = useAuthStore()

  useEffect(() => {
    // Persist locale so the API client can send the correct Accept-Language header
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale)
    }
    initialize()
  }, [locale, initialize])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
      <Toaster
        position={locale === 'ar' ? 'top-left' : 'top-right'}
        toastOptions={{
          duration: 4000,
          style: {
            background:  'hsl(var(--card))',
            color:       'hsl(var(--foreground))',
            border:      '1px solid hsl(var(--border))',
            borderRadius:'12px',
            fontSize:    '14px',
            fontFamily:  locale === 'ar' ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif",
            direction:   locale === 'ar' ? 'rtl' : 'ltr',
          },
          success: { iconTheme: { primary: '#069880', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </ThemeProvider>
  )
}
