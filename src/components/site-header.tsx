'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useHeader } from '@/components/header-context'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/scoreboard', label: 'Scoreboard' },
  { href: '/standings', label: 'Standings' },
  { href: '/teams', label: 'Teams' },
  { href: '/injuries', label: 'Injuries' },
]

const adminItems = [
  { href: '/admin', label: 'Admin Dashboard' },
  { href: '/admin/scrapers', label: 'Scrapers Status' },
  { href: '/admin/tools', label: 'Dev Tools' },
  { href: '/data-maps', label: 'Data Maps' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { config } = useHeader()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4 flex h-14 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] flex flex-col">
            <SheetHeader>
              <SheetTitle>NFL Stats</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-2 border-t" />
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System
              </span>
              {adminItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={toggleTheme}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <span className="font-semibold">{config.title}</span>

        {/* Custom content slot (right side) */}
        {config.customContent && (
          <div className="ml-auto flex items-center gap-2">
            {config.customContent}
          </div>
        )}
      </div>
    </header>
  )
}
