'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { DollarSign, Home, Calendar, Star, TrendingUp, Clock, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { api } from '@/lib/api/client'
import { formatPrice, formatDate, cn } from '@/lib/utils'

interface OwnerStats {
  total_properties:  number
  total_bookings:    number
  monthly_earnings:  number
  avg_rating:        number
  pending_bookings:  number
  occupancy_rate:    number
}

interface RecentBooking {
  id: string
  reference: string
  status: string
  dates: { check_in: string; check_out: string }
  pricing: { total: number; currency: string }
  guest: { name: string; avatar?: string }
  property: { id: string; title: { ar: string; fr?: string }; cover_image?: string }
}

export default function OwnerDashboardPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { user } = useAuthStore()

  const [stats,    setStats]    = useState<OwnerStats | null>(null)
  const [bookings, setBookings] = useState<RecentBooking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setError(false)
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/owner/dashboard/stats'),
          api.get('/owner/bookings', { params: { per_page: 5, sort: 'newest' } }),
        ])
        setStats(statsRes?.data ?? null)
        setBookings(bookingsRes?.data?.items ?? bookingsRes?.data ?? [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = stats ? [
    { icon: DollarSign,  value: formatPrice(stats.monthly_earnings),   label: ar ? 'أرباح هذا الشهر' : 'Revenus ce mois',   color: 'text-green-500',  bg: 'bg-green-50  dark:bg-green-900/20',  suffix: '' },
    { icon: Home,        value: stats.total_properties,                 label: ar ? 'عقاراتي'         : 'Mes propriétés',    color: 'text-primary',    bg: 'bg-primary/10',                       suffix: '' },
    { icon: Calendar,    value: stats.total_bookings,                   label: ar ? 'إجمالي الحجوزات' : 'Total réservations',color: 'text-blue-500',   bg: 'bg-blue-50   dark:bg-blue-900/20',   suffix: '' },
    { icon: Star,        value: stats.avg_rating.toFixed(1),            label: ar ? 'متوسط التقييم'   : 'Note moyenne',     color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', suffix: '/5' },
  ] : []

  const statusConfig: Record<string, { color: string; label: { ar: string; fr: string }; icon: any }> = {
    pending:   { color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', label: { ar: 'قيد الانتظار', fr: 'En attente' },  icon: Clock },
    confirmed: { color: 'text-green-500  bg-green-50  dark:bg-green-900/20',  label: { ar: 'مؤكد',         fr: 'Confirmé' },    icon: CheckCircle },
    cancelled: { color: 'text-red-500    bg-red-50    dark:bg-red-900/20',    label: { ar: 'ملغى',         fr: 'Annulé' },      icon: XCircle },
    completed: { color: 'text-blue-500   bg-blue-50   dark:bg-blue-900/20',   label: { ar: 'مكتمل',        fr: 'Terminé' },     icon: CheckCircle },
    rejected:  { color: 'text-gray-500   bg-gray-50   dark:bg-gray-900/20',   label: { ar: 'مرفوض',        fr: 'Refusé' },      icon: XCircle },
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-12 bg-muted rounded-2xl" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">{ar ? 'خطأ في التحميل' : 'Erreur de chargement'}</h2>
        <p className="text-muted-foreground text-sm mb-4">{ar ? 'تعذر تحميل البيانات، حاول مجدداً' : 'Impossible de charger les données'}</p>
        <button onClick={() => { setLoading(true); setError(false) }} className="btn-primary text-sm py-2 px-4">
          {ar ? 'إعادة المحاولة' : 'Réessayer'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {ar ? `مرحباً ${user?.first_name ?? ''}` : `Bonjour, ${user?.first_name ?? ''}`} 👋
            </h1>
            <p className="text-muted-foreground mt-0.5">
              {ar ? 'إدارة عقاراتك وحجوزاتك' : 'Gérez vos propriétés et réservations'}
            </p>
          </div>
          {stats?.pending_bookings && stats.pending_bookings > 0 ? (
            <Link
              href={`/${locale}/owner/bookings?status=pending`}
              className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-sm font-semibold px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors"
            >
              <Clock className="w-4 h-4" />
              {stats.pending_bookings} {ar ? 'طلبات معلقة' : 'en attente'}
            </Link>
          ) : null}
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ icon: Icon, value, label, color, bg, suffix }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card rounded-2xl p-5 border border-border"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <p className="text-xl font-bold text-foreground">{value}{suffix}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Occupancy */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-5 border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground text-sm">
              {ar ? 'معدل الإشغال هذا الشهر' : 'Taux d\'occupation ce mois'}
            </p>
            <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              {stats.occupancy_rate}%
            </div>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.occupancy_rate}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              className="h-full bg-gradient-brand rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {ar ? 'آخر الحجوزات' : 'Dernières réservations'}
          </h2>
          <Link href={`/${locale}/owner/bookings`} className="flex items-center gap-1 text-primary text-sm hover:underline">
            {ar ? 'عرض الكل' : 'Voir tout'}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-muted/40 rounded-2xl border border-dashed border-border">
            <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">{ar ? 'لا توجد حجوزات بعد' : 'Aucune réservation'}</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="p-4 text-start font-medium">{ar ? 'العقار / الضيف' : 'Propriété / Hôte'}</th>
                  <th className="p-4 text-start font-medium hidden md:table-cell">{ar ? 'التواريخ' : 'Dates'}</th>
                  <th className="p-4 text-start font-medium hidden lg:table-cell">{ar ? 'المبلغ' : 'Montant'}</th>
                  <th className="p-4 text-start font-medium">{ar ? 'الحالة' : 'Statut'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map(booking => {
                  const sc     = statusConfig[booking.status] || statusConfig.pending
                  const SI     = sc.icon
                  const img    = booking.property.cover_image
                  const title  = ar ? booking.property.title?.ar : (booking.property.title?.fr || booking.property.title?.ar)
                  return (
                    <tr key={booking.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                            {img && <Image src={img} alt={title || ''} width={40} height={40} className="object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground truncate max-w-[140px]">{title}</p>
                            <p className="text-muted-foreground text-xs">{booking.guest.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">
                        <div className="text-xs">
                          <div>{formatDate(booking.dates?.check_in, locale)}</div>
                          <div>{formatDate(booking.dates?.check_out, locale)}</div>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell font-semibold text-foreground">
                        {formatPrice(booking.pricing?.total ?? 0, booking.pricing?.currency ?? 'MAD')}
                      </td>
                      <td className="p-4">
                        <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full', sc.color)}>
                          <SI className="w-3 h-3" />
                          {sc.label[locale as 'ar' | 'fr']}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
