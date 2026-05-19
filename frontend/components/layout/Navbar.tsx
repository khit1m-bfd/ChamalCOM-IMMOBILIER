'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Search, Heart, Bell, User, Globe, ChevronDown,
  Home, Building2, PlusCircle, LayoutDashboard, LogOut, Settings
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function Navbar() {
  const t       = useTranslations()
  const locale  = useLocale()
  const router  = useRouter()
  const pathname= usePathname()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()

  const [isScrolled,    setIsScrolled]    = useState(false)
  const [isMobileOpen,  setIsMobileOpen]  = useState(false)
  const [isUserMenuOpen,setIsUserMenuOpen] = useState(false)
  const [isLangOpen,    setIsLangOpen]    = useState(false)

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: `/${locale}`,             label: t('nav.home'),       icon: Home },
    { href: `/${locale}/properties`,  label: t('nav.properties'), icon: Building2 },
  ]

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
    setIsLangOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}`)
    setIsUserMenuOpen(false)
  }

  const getDashboardPath = () => {
    const role = user?.role
    if (role === 'admin') return `/${locale}/admin/dashboard`
    if (role === 'owner') return `/${locale}/owner/dashboard`
    return `/${locale}/client/dashboard`
  }

  return (
    <header
      className={cn(
        'fixed top-0 start-0 end-0 z-50 transition-all duration-300',
        isScrolled || !isHome
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-transparent'
      )}
    >
      <nav className="page-container h-16 md:h-20 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────────── */}
        <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-sm md:text-base">ش</span>
          </div>
          <span className={cn(
            'font-bold text-lg md:text-xl transition-colors',
            isScrolled || !isHome ? 'text-foreground' : 'text-white'
          )}>
            {locale === 'ar' ? 'شمال كوم' : 'ChamalCom'}
          </span>
        </Link>

        {/* ── Desktop Nav Links ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : isScrolled || !isHome
                    ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right Actions ─────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isScrolled || !isHome
                  ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'العربية' : 'Français'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full mt-1 glass rounded-2xl shadow-glass-md border border-white/20 overflow-hidden min-w-[140px] z-50',
                    locale === 'ar' ? 'left-0' : 'right-0'
                  )}
                >
                  {(['ar', 'fr'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => switchLocale(lang)}
                      className={cn(
                        'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-start hover:bg-primary/10 transition-colors',
                        locale === lang && 'bg-primary/10 text-primary font-medium'
                      )}
                    >
                      <span>{lang === 'ar' ? '🇲🇦' : '🇫🇷'}</span>
                      <span>{lang === 'ar' ? 'العربية' : 'Français'}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Buttons or User Menu */}
          {user ? (
            <>
              {/* Add Property (Owner) */}
              {user.role === 'owner' && (
                <Link
                  href={`/${locale}/owner/properties/new`}
                  className="hidden md:flex items-center gap-1.5 btn-primary text-xs py-2 px-4"
                >
                  <PlusCircle className="w-4 h-4" />
                  {t('nav.addProperty')}
                </Link>
              )}

              {/* Notifications */}
              <Link
                href={`/${locale}/client/notifications`}
                className={cn(
                  'relative p-2 rounded-xl transition-colors',
                  isScrolled || !isHome
                    ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 end-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-primary/20">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.full_name} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-semibold text-sm">
                        {user.first_name?.[0]}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', isUserMenuOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'absolute top-full mt-1 glass rounded-2xl shadow-glass-md border border-white/20 overflow-hidden min-w-[200px] z-50',
                        locale === 'ar' ? 'left-0' : 'right-0'
                      )}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-border/50">
                        <p className="font-semibold text-sm text-foreground">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                      </div>

                      <div className="py-1">
                        {[
                          { href: getDashboardPath(), label: t('nav.dashboard'), icon: LayoutDashboard },
                          { href: `/${locale}/profile`, label: t('nav.profile'),  icon: User },
                          { href: `/${locale}/favorites`, label: t('nav.favorites'), icon: Heart },
                          { href: `/${locale}/messages`, label: t('nav.messages'), icon: Search },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-border/50 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav.logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/auth/login`}
                className={cn(
                  'hidden sm:flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  isScrolled || !isHome
                    ? 'text-foreground hover:bg-accent'
                    : 'text-white hover:bg-white/10'
                )}
              >
                {t('nav.login')}
              </Link>
              <Link href={`/${locale}/auth/register`} className="btn-primary text-sm py-2 px-4">
                {t('nav.register')}
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={cn(
              'md:hidden p-2 rounded-xl transition-colors',
              isScrolled || !isHome
                ? 'text-foreground hover:bg-accent'
                : 'text-white hover:bg-white/10'
            )}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="page-container py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              {!user && (
                <div className="pt-2 flex gap-2">
                  <Link href={`/${locale}/auth/login`} onClick={() => setIsMobileOpen(false)} className="flex-1 btn-outline text-sm py-2.5 text-center">
                    {t('nav.login')}
                  </Link>
                  <Link href={`/${locale}/auth/register`} onClick={() => setIsMobileOpen(false)} className="flex-1 btn-primary text-sm py-2.5 text-center">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside overlay */}
      {(isUserMenuOpen || isLangOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setIsUserMenuOpen(false); setIsLangOpen(false) }}
        />
      )}
    </header>
  )
}
