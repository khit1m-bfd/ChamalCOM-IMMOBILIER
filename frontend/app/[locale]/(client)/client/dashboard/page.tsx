'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Calendar, Heart, MessageSquare, User, MapPin, Star, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { formatPrice, formatDate, cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending:   { color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',  icon: Clock,         label: { ar: 'قيد الانتظار', fr: 'En attente' } },
  confirmed: { color: 'text-green-500  bg-green-50  dark:bg-green-900/20',   icon: CheckCircle,   label: { ar: 'مؤكد',         fr: 'Confirmé' } },
  cancelled: { color: 'text-red-500    bg-red-50    dark:bg-red-900/20',     icon: XCircle,       label: { ar: 'ملغى',         fr: 'Annulé' } },
  completed: { color: 'text-blue-500   bg-blue-50   dark:bg-blue-900/20',    icon: CheckCircle,   label: { ar: 'مكتمل',        fr: 'Terminé' } },
  rejected:  { color: 'text-gray-500   bg-gray-50   dark:bg-gray-900/20',    icon: XCircle,       label: { ar: 'مرفوض',        fr: 'Refusé' } },
}

export default function ClientDashboardPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { user } = useAuthStore()
  const { bookings, fetchBookings, loading } = useBookingStore()
  const { favorites, fetchFavorites }        = usePropertyStore()

  useEffect(() => {
    fetchBookings()
    fetchFavorites()
  }, [fetchBookings, fetchFavorites])

  const upcoming   = bookings.filter(b => ['pending', 'confirmed'].includes(b.status) && new Date(b.check_in_date) >= new Date())
  const past       = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status)).slice(0, 3)

  const stats = [
    { icon: Calendar,      value: upcoming.length,  label: ar ? 'حجوزات قادمة' : 'Séjours à venir',    color: 'text-primary',   bg: 'bg-primary/10' },
    { icon: Heart,         value: favorites.length, label: ar ? 'عقارات محفوظة' : 'Logements sauvés',   color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: CheckCircle,   value: bookings.filter(b => b.status === 'completed').length, label: ar ? 'إقامات مكتملة' : 'Séjours réalisés', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: Star,          value: bookings.filter(b => b.status === 'completed' && b.payment_status === 'paid').length, label: ar ? 'تقييمات بانتظارك' : 'Avis à laisser', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {ar ? `مرحباً ${user?.first_name} 👋` : `Bonjour, ${user?.first_name} 👋`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar ? 'إليك نظرة عامة على حسابك' : 'Voici un aperçu de votre compte'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, value, label, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl p-5 border border-border"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-muted-foreground text-sm mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{ar ? 'الحجوزات القادمة' : 'Séjours à venir'}</h2>
          <Link href={`/${locale}/client/bookings`} className="text-primary text-sm hover:underline">
            {ar ? 'عرض الكل' : 'Voir tout'}
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-12 bg-muted/40 rounded-2xl border border-dashed border-border">
            <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">{ar ? 'لا توجد حجوزات قادمة' : 'Aucun séjour à venir'}</p>
            <Link href={`/${locale}/properties`} className="inline-block mt-3 text-primary text-sm font-semibold hover:underline">
              {ar ? 'استكشف العقارات' : 'Explorer les logements'}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking, i) => {
              const status = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]
              const StatusIcon = status.icon
              const primaryImg = booking.property?.images?.find(im => im.is_primary) ?? booking.property?.images?.[0]
              const propTitle  = booking.property?.title_ar || ''

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: ar ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/${locale}/client/bookings/${booking.id}`}>
                    <div className="flex gap-4 bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors group">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        {primaryImg && (
                          <Image src={primaryImg.url} alt={propTitle} width={80} height={80} className="w-full h-full object-cover" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                            {propTitle}
                          </h3>
                          <span className={cn('flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', status.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label[locale as 'ar' | 'fr']}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {booking.property?.city}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{formatDate(booking.check_in_date, locale)}</span>
                          <span>→</span>
                          <span>{formatDate(booking.check_out_date, locale)}</span>
                          <span className="ms-auto font-semibold text-foreground">
                            {formatPrice(booking.total_amount, booking.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Favorites preview */}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">{ar ? 'العقارات المحفوظة' : 'Logements sauvegardés'}</h2>
            <Link href={`/${locale}/client/favorites`} className="text-primary text-sm hover:underline">
              {ar ? 'عرض الكل' : 'Voir tout'}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {favorites.slice(0, 3).map((prop, i) => {
              const img = prop.images?.find(x => x.is_primary) ?? prop.images?.[0]
              return (
                <Link key={prop.id} href={`/${locale}/properties/${prop.id}`}>
                  <div className="rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors group">
                    <div className="relative h-28 bg-muted">
                      {img && <Image src={img.url} alt={prop.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-foreground truncate">
                        {ar ? prop.title_ar : (prop.title_fr || prop.title_ar)}
                      </p>
                      <p className="text-primary text-xs font-semibold mt-0.5">
                        {formatPrice(prop.price_per_night)} <span className="text-muted-foreground font-normal">/ {ar ? 'ليلة' : 'nuit'}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: `/${locale}/client/bookings`,  icon: Calendar,      label: ar ? 'حجوزاتي'    : 'Mes réservations' },
          { href: `/${locale}/client/favorites`, icon: Heart,         label: ar ? 'المفضلة'    : 'Favoris' },
          { href: `/${locale}/client/messages`,  icon: MessageSquare, label: ar ? 'الرسائل'    : 'Messages' },
          { href: `/${locale}/client/profile`,   icon: User,          label: ar ? 'ملفي الشخصي': 'Mon profil' },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-center">
              <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
