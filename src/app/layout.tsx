import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { HeaderProvider } from '@/components/header-context'
import { SiteHeader } from '@/components/site-header'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export const metadata: Metadata = {
  title: {
    default: 'NFL Stats Platform',
    template: '%s | NFL Stats Platform',
  },
  description: 'Comprehensive NFL statistics, game scores, and advanced analytics.',
  keywords: ['NFL', 'football', 'statistics', 'scores', 'analytics', 'next gen stats'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NFL Stats',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ServiceWorkerRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HeaderProvider>
            <SiteHeader />
            {children}
          </HeaderProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
