'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  LayoutDashboard, Users, Home, Calendar, BarChart3,
  MessageSquare, Shield, Settings, LogOut, ChevronRight, Waves,
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { key: 'dashboard',   href: '/admin/dashboard',   icon: LayoutDashboard, label: { ar: 'لوحة التحكم',   fr: 'Tableau de bord' } },
  { key: 'users',       href: '/admin/users',       icon: Users,           label: { ar: 'المستخدمون',    fr: 'Utilisateurs' } },
  { key: 'properties',  href: '/admin/properties',  icon: Home,            label: { ar: 'العقارات',      fr: 'Propriétés' } },
  { key: 'bookings',    href: '/admin/bookings',    icon: Calendar,        label: { ar: 'الحجوزات',      fr: 'Réservations' } },
  { key: 'analytics',  href: '/admin/analytics',   icon: BarChart3,       label: { ar: 'الإحصائيات',   fr: 'Analytiques' } },
  { key: 'messages',   href: '/admin/messages',    icon: MessageSquare,   label: { ar: 'الرسائل',       fr: 'Messages' } },
  { key: 'moderation', href: '/admin/moderation',  icon: Shield,          label: { ar: 'الإشراف',       fr: 'Modération' } },
  { key: 'settings',   href: '/admin/settings',    icon: Settings,        label: { ar: 'الإعدادات',     fr: 'Paramètres' } },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale   = useLocale()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const ar = locale === 'ar'

  const isActive = (href: string) => pathname.includes(href)

  return (
    <div className="min-h-screen bg-muted/30 flex">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen border-e border-border bg-card">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold bg-gradient-brand bg-clip-text text-transparent block leading-none">ChamalCom</span>
              <span className="text-[10px] text-muted-foreground">{ar ? 'لوحة الإدارة' : 'Administration'}</span>
            </div>
          </Link>
        </div>

        {/* Admin info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-xs truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-muted-foreground text-[10px]">{ar ? 'مدير النظام' : 'Administrateur'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
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
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
