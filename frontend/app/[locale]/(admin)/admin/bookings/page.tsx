'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatPrice, formatDate, cn } from '@/lib/utils'

interface AdminBooking {
  id: string
  reference: string
  status: string
  created_at: string
  dates: { check_in: string; check_out: string; nights: number }
  pricing: { total: number; currency: string }
  guest: { name: string; email: string }
  property: { title: { ar: string; fr?: string }; location?: { city: string } }
}

const STATUS: Record<string, { label: { ar: string; fr: string }; color: string }> = {
  pending:   { label: { ar: 'قيد الانتظار', fr: 'En attente' }, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
  confirmed: { label: { ar: 'مؤكد',         fr: 'Confirmé' },   color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  completed: { label: { ar: 'مكتمل',        fr: 'Terminé' },    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  cancelled: { label: { ar: 'ملغى',         fr: 'Annulé' },     color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  rejected:  { label: { ar: 'مرفوض',        fr: 'Refusé' },     color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20' },
}

export default function AdminBookingsPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [bookings,  setBookings]  = useState<AdminBooking[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await api.get('/admin/bookings', {
        params: { status: statusFilter || undefined, per_page: 30, sort: 'newest' }
      })
      setBookings(result.data?.items || result.data || result.items || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const TABS = ['', 'pending', 'confirmed', 'completed', 'cancelled'] as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'إدارة الحجوزات' : 'Gestion des réservations'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {ar ? 'عرض وإدارة جميع الحجوزات في المنصة' : 'Consultez et gérez toutes les réservations'}
        </p>
      </div>

      {/* Tab filters */}
      <div className="flex gap-1 flex-wrap bg-muted rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              statusFilter === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === '' ? (ar ? 'الكل' : 'Tous') : STATUS[tab]?.label[locale as 'ar' | 'fr'] || tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{ar ? 'خطأ في التحميل' : 'Erreur de chargement'}</p>
          <button onClick={load} className="text-primary text-sm font-semibold hover:underline">{ar ? 'إعادة المحاولة' : 'Réessayer'}</button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{ar ? 'لا توجد حجوزات' : 'Aucune réservation'}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                <th className="p-4 text-start font-medium">{ar ? 'المرجع' : 'Référence'}</th>
                <th className="p-4 text-start font-medium hidden md:table-cell">{ar ? 'العقار' : 'Propriété'}</th>
                <th className="p-4 text-start font-medium hidden lg:table-cell">{ar ? 'الضيف' : 'Client'}</th>
                <th className="p-4 text-start font-medium hidden xl:table-cell">{ar ? 'التواريخ' : 'Dates'}</th>
                <th className="p-4 text-start font-medium">{ar ? 'المبلغ' : 'Montant'}</th>
                <th className="p-4 text-start font-medium">{ar ? 'الحالة' : 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking, i) => {
                const sc    = STATUS[booking.status] || STATUS.pending
                const title = ar ? booking.property?.title?.ar : (booking.property?.title?.fr || booking.property?.title?.ar)
                return (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-mono text-xs text-primary">{booking.reference}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(booking.created_at, locale)}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{title}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <p className="text-sm text-foreground">{booking.guest?.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{booking.guest?.email}</p>
                    </td>
                    <td className="p-4 hidden xl:table-cell text-xs text-muted-foreground">
                      {booking.dates?.check_in && <div>{formatDate(booking.dates.check_in, locale)}</div>}
                      {booking.dates?.check_out && <div>{formatDate(booking.dates.check_out, locale)}</div>}
                    </td>
                    <td className="p-4 font-semibold text-foreground text-sm">
                      {formatPrice(booking.pricing?.total ?? 0, booking.pricing?.currency ?? 'MAD')}
                    </td>
                    <td className="p-4">
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-full', sc.color)}>
                        {sc.label[locale as 'ar' | 'fr']}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
