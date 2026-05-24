'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Star } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { formatPrice, formatDate, nightsBetween, cn } from '@/lib/utils'

const TABS = [
  { key: 'upcoming', label: { ar: 'القادمة',  fr: 'À venir' } },
  { key: 'past',     label: { ar: 'السابقة',  fr: 'Passées' } },
  { key: 'all',      label: { ar: 'الكل',     fr: 'Toutes' } },
]

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: { ar: string; fr: string } }> = {
  pending:   { color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', icon: Clock,        label: { ar: 'قيد الانتظار', fr: 'En attente' } },
  confirmed: { color: 'text-green-500  bg-green-50  dark:bg-green-900/20',  icon: CheckCircle,  label: { ar: 'مؤكد',         fr: 'Confirmé' } },
  cancelled: { color: 'text-red-500    bg-red-50    dark:bg-red-900/20',    icon: XCircle,      label: { ar: 'ملغى',         fr: 'Annulé' } },
  completed: { color: 'text-blue-500   bg-blue-50   dark:bg-blue-900/20',   icon: CheckCircle,  label: { ar: 'مكتمل',        fr: 'Terminé' } },
  rejected:  { color: 'text-gray-500   bg-gray-50   dark:bg-gray-900/20',   icon: XCircle,      label: { ar: 'مرفوض',        fr: 'Refusé' } },
}

export default function ClientBookingsPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { bookings, fetchBookings, cancelBooking, loading } = useBookingStore()
  const [activeTab,        setActiveTab]        = useState('upcoming')
  const [cancelling,       setCancelling]       = useState<string | null>(null)
  const [confirmCancel,    setConfirmCancel]    = useState<string | null>(null)

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const now = new Date()
  const filtered = bookings.filter(b => {
    if (activeTab === 'upcoming') return ['pending','confirmed'].includes(b.status) && new Date(b.dates?.check_in) >= now
    if (activeTab === 'past')     return ['completed','cancelled','rejected'].includes(b.status) || new Date(b.dates?.check_out) < now
    return true
  })

  const handleCancel = async (id: string) => {
    setConfirmCancel(null)
    setCancelling(id)
    try {
      await cancelBooking(id, ar ? 'إلغاء من قبل العميل' : 'Annulation par le client')
    } catch {
      /* error handled in store */
    } finally {
      setCancelling(null)
    }
  }

  // canBeReviewed: completed OR confirmed with past checkout
  const canBeReviewed = (b: any) => {
    if (b.guest_reviewed) return false
    if (b.status === 'completed') return true
    if (b.status === 'confirmed' && b.dates?.check_out && new Date(b.dates.check_out) < now) return true
    return false
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'حجوزاتي' : 'Mes réservations'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{bookings.length} {ar ? 'حجز' : 'réservation(s)'}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label[locale as 'ar' | 'fr']}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{ar ? 'لا توجد حجوزات' : 'Aucune réservation'}</p>
          <Link href={`/${locale}/properties`} className="inline-block mt-3 text-primary text-sm font-semibold hover:underline">
            {ar ? 'استكشف العقارات' : 'Explorer les logements'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => {
            const sc        = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
            const SI        = sc.icon
            const nights    = booking.dates?.nights ?? 0
            const img       = booking.property?.cover_image
            const title     = ar ? booking.property?.title?.ar : (booking.property?.title?.fr || booking.property?.title?.ar) || ''
            const canCancel = booking.can_cancel

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/20 transition-colors"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {img && <Image src={img} alt={title || ''} width={128} height={128} className="w-full h-full object-cover" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{booking.reference}</p>
                        <Link href={`/${locale}/properties/${booking.property?.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{title}</h3>
                        </Link>
                        {booking.property?.address && (
                          <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {booking.property.address}
                          </p>
                        )}
                      </div>
                      <span className={cn('flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full', sc.color)}>
                        <SI className="w-3 h-3" />
                        {sc.label[locale as 'ar' | 'fr']}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(booking.dates?.check_in, locale)} → {formatDate(booking.dates?.check_out, locale)}
                      </span>
                      <span>{nights} {ar ? 'ليالٍ' : 'nuits'}</span>
                      <span className="ms-auto font-semibold text-foreground text-sm">
                        {formatPrice(booking.pricing?.total ?? 0, booking.pricing?.currency ?? 'MAD')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link
                        href={`/${locale}/client/bookings/${booking.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                      >
                        {ar ? 'التفاصيل' : 'Détails'}
                      </Link>
                      {canBeReviewed(booking) && (
                        <Link
                          href={`/${locale}/client/bookings/${booking.id}/review`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          {ar ? 'قيّم إقامتك' : 'Laisser un avis'}
                        </Link>
                      )}
                      {canCancel && confirmCancel !== booking.id && (
                        <button
                          onClick={() => setConfirmCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          className="text-xs px-3 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors font-medium disabled:opacity-50"
                        >
                          {cancelling === booking.id ? '...' : (ar ? 'إلغاء' : 'Annuler')}
                        </button>
                      )}
                      {confirmCancel === booking.id && (
                        <div className="flex items-center gap-1.5 bg-destructive/5 rounded-lg px-2 py-1 border border-destructive/20">
                          <span className="text-xs text-destructive font-medium">
                            {ar ? 'تأكيد الإلغاء؟' : 'Confirmer ?'}
                          </span>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="text-xs px-2 py-0.5 bg-destructive text-white rounded font-medium"
                          >
                            {ar ? 'نعم' : 'Oui'}
                          </button>
                          <button
                            onClick={() => setConfirmCancel(null)}
                            className="text-xs px-2 py-0.5 bg-muted rounded font-medium"
                          >
                            {ar ? 'لا' : 'Non'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
