'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, MapPin, Users, CreditCard, Download } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { formatPrice, formatDate } from '@/lib/utils'

export default function BookingConfirmPage() {
  const { id }   = useParams<{ id: string }>()
  const locale   = useLocale()
  const ar       = locale === 'ar'

  const { currentBooking, fetchBooking, loading } = useBookingStore()

  useEffect(() => { fetchBooking(id) }, [id, fetchBooking])

  if (loading) {
    return (
      <div className="page-container py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted animate-pulse mx-auto" />
      </div>
    )
  }

  const booking = currentBooking
  if (!booking) return null

  const isPending   = booking.status === 'pending'
  const isConfirmed = booking.status === 'confirmed'
  const nights      = booking.dates?.nights ?? 0
  const currency    = booking.pricing?.currency ?? 'MAD'
  const perNight    = nights > 0 ? Math.round((booking.pricing?.base_price ?? 0) / nights) : 0
  const title       = booking.property?.title?.ar ?? ''

  return (
    <div className="page-container py-12 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isConfirmed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
          <CheckCircle className={`w-10 h-10 ${isConfirmed ? 'text-green-500' : 'text-orange-500'}`} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isPending
            ? (ar ? 'طلب الحجز مُرسَل!' : 'Demande envoyée !')
            : (ar ? 'تم تأكيد الحجز!' : 'Réservation confirmée !')
          }
        </h1>
        <p className="text-muted-foreground">
          {isPending
            ? (ar ? 'في انتظار موافقة المضيف' : 'En attente de confirmation de l\'hôte')
            : (ar ? 'حجزك مؤكد، استمتع بإقامتك!' : 'Votre séjour est confirmé !')
          }
        </p>
      </motion.div>

      {/* Booking summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-3xl border border-border p-6 space-y-5"
      >
        {/* Reference */}
        <div className="flex items-center justify-between bg-muted/50 rounded-2xl px-4 py-3">
          <p className="text-sm text-muted-foreground">{ar ? 'رقم الحجز' : 'Numéro de réservation'}</p>
          <p className="font-bold text-foreground font-mono" dir="ltr">{booking.reference}</p>
        </div>

        {/* Property */}
        {booking.property && (
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              {booking.property.cover_image && (
                <Image src={booking.property.cover_image} alt={title} width={64} height={64} className="object-cover" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{title}</p>
              <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {booking.property.address}
              </p>
            </div>
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Calendar, label: ar ? 'تاريخ الوصول' : 'Arrivée',     value: formatDate(booking.dates?.check_in, locale) },
            { icon: Calendar, label: ar ? 'تاريخ المغادرة' : 'Départ',    value: formatDate(booking.dates?.check_out, locale) },
            { icon: Users,    label: ar ? 'عدد الضيوف' : 'Voyageurs',     value: `${booking.guests?.total ?? 0}` },
            { icon: Calendar, label: ar ? 'عدد الليالي' : 'Nuits',        value: `${nights}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-semibold text-foreground text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-border" />

        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(perNight, currency)} × {nights} {ar ? 'ليالٍ' : 'nuits'}</span>
            <span>{formatPrice(booking.pricing?.base_price ?? 0, currency)}</span>
          </div>
          {(booking.pricing?.cleaning_fee ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{ar ? 'رسوم التنظيف' : 'Frais de ménage'}</span>
              <span>{formatPrice(booking.pricing?.cleaning_fee ?? 0, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{ar ? 'رسوم الخدمة' : 'Frais de service'}</span>
            <span>{formatPrice(booking.pricing?.service_fee ?? 0, currency)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-bold text-foreground">
            <span>{ar ? 'المجموع' : 'Total'}</span>
            <span>{formatPrice(booking.pricing?.total ?? 0, currency)}</span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 mt-6"
      >
        <Link
          href={`/${locale}/client/bookings`}
          className="flex-1 h-12 bg-gradient-brand text-white font-semibold rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-glow-blue"
        >
          {ar ? 'عرض حجوزاتي' : 'Voir mes réservations'}
        </Link>
        <Link
          href={`/${locale}/properties`}
          className="flex-1 h-12 border-2 border-border text-foreground font-semibold rounded-2xl flex items-center justify-center hover:bg-muted transition-colors"
        >
          {ar ? 'استكشف المزيد' : 'Explorer plus'}
        </Link>
      </motion.div>
    </div>
  )
}
