'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { LayoutDashboard, Home, Calendar, DollarSign, MessageSquare, User, LogOut, PlusCircle, ChevronRight, BarChart3 } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const NAV_ITEMS = [
  { key: 'dashboard',   href: '/owner/dashboard',   icon: LayoutDashboard, label: { ar: 'لوحة التحكم',   fr: 'Tableau de bord' } },
  { key: 'properties',  href: '/owner/properties',  icon: Home,            label: { ar: 'عقاراتي',       fr: 'Mes propriétés' } },
  { key: 'bookings',    href: '/owner/bookings',    icon: Calendar,        label: { ar: 'الحجوزات',      fr: 'Réservations' } },
  { key: 'earnings',    href: '/owner/earnings',    icon: DollarSign,      label: { ar: 'الأرباح',       fr: 'Revenus' } },
  { key: 'analytics',  href: '/owner/analytics',   icon: BarChart3,       label: { ar: 'الإحصائيات',   fr: 'Statistiques' } },
  { key: 'messages',   href: '/owner/messages',    icon: MessageSquare,   label: { ar: 'الرسائل',       fr: 'Messages' } },
  { key: 'profile',    href: '/owner/profile',     icon: User,            label: { ar: 'ملفي',          fr: 'Mon profil' } },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
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
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
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
                    <p className="text-xs text-muted-foreground">{ar ? 'مضيف' : 'Hôte'}</p>
                  </div>
                </div>
                <Link
                  href={`/${locale}/owner/properties/new`}
                  className="flex items-center justify-center gap-2 w-full h-9 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  {ar ? 'إضافة عقار' : 'Ajouter'}
                </Link>
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
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
