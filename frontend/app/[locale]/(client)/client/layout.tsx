'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Calendar, Heart, MessageSquare, User, Home, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const NAV_ITEMS = [
  { key: 'dashboard', href: '/client/dashboard',  icon: Home,          label: { ar: 'الرئيسية',      fr: 'Tableau de bord' } },
  { key: 'bookings',  href: '/client/bookings',   icon: Calendar,      label: { ar: 'حجوزاتي',       fr: 'Mes réservations' } },
  { key: 'favorites', href: '/client/favorites',  icon: Heart,         label: { ar: 'المفضلة',        fr: 'Favoris' } },
  { key: 'messages',  href: '/client/messages',   icon: MessageSquare, label: { ar: 'الرسائل',        fr: 'Messages' } },
  { key: 'profile',   href: '/client/profile',    icon: User,          label: { ar: 'ملفي الشخصي',   fr: 'Mon profil' } },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const locale   = useLocale()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const ar = locale === 'ar'

  const isActive = (href: string) => pathname.includes(href)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-container py-8">
        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
            <div className="bg-card rounded-3xl border border-border overflow-hidden sticky top-24">

              {/* User header */}
              <div className="p-6 border-b border-border bg-gradient-brand/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                    {user?.avatar ? (
                      <Image src={user.avatar} alt={user.first_name} width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white font-bold">
                        {user?.first_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map(({ key, href, icon: Icon, label }) => (
                  <Link
                    key={key}
                    href={`/${locale}${href}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive(href)
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{label[locale as 'ar' | 'fr']}</span>
                    {isActive(href) && <ChevronRight className={cn('w-3.5 h-3.5 opacity-70', ar && 'rotate-180')} />}
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {ar ? 'تسجيل الخروج' : 'Se déconnecter'}
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50 px-2 pb-safe">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(({ key, href, icon: Icon, label }) => (
            <Link
              key={key}
              href={`/${locale}${href}`}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors',
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              {label[locale as 'ar' | 'fr']}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
