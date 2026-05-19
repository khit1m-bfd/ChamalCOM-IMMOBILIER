'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Calendar, Users, Minus, Plus, Zap, Shield, Star } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { useAuthStore } from '@/lib/stores/authStore'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { usePropertyStore, type Property } from '@/lib/stores/propertyStore'
import { propertiesApi } from '@/lib/api/properties'
import { formatPrice, nightsBetween, formatDateShort, cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { ar as arLocale, fr as frLocale } from 'date-fns/locale'

interface Props {
  property: Property
}

export function BookingPanel({ property }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const isAr   = locale === 'ar'

  const { user }      = useAuthStore()
  const { createBooking, loading: bookingLoading, priceQuote, fetchPriceQuote, clearPriceQuote } = useBookingStore()

  const [range,    setRange]    = useState<{ from?: Date; to?: Date }>({})
  const [guests,   setGuests]   = useState(1)
  const [showCal,  setShowCal]  = useState(false)
  const [blocked,  setBlocked]  = useState<Date[]>([])
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const checkIn  = range.from
  const checkOut = range.to
  const nights   = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const now = new Date()
        // api.get returns body directly; backend: { success, data: { blocked_dates: [...] } }
        const { data } = await propertiesApi.availability(property.id, now.getMonth() + 1, now.getFullYear())
        setBlocked((data?.blocked_dates || []).map((d: string) => new Date(d)))
      } catch { /* silent */ }
    }
    fetchBlocked()
  }, [property.id])

  const minNights   = property.rules?.min_nights   ?? 1
  const maxGuests   = property.capacity?.max_guests ?? 10
  const priceNight  = property.pricing?.per_night   ?? 0
  const currency    = property.pricing?.currency    ?? 'MAD'
  const isInstant   = property.rules?.instant_booking ?? false
  const ratingAvg   = property.stats?.rating_average  ?? 0
  const ratingCount = property.stats?.rating_count    ?? 0

  useEffect(() => {
    if (checkIn && checkOut && nights >= minNights) {
      fetchPriceQuote(property.id, format(checkIn, 'yyyy-MM-dd'), format(checkOut, 'yyyy-MM-dd'))
    } else {
      clearPriceQuote()
    }
  }, [checkIn, checkOut, property.id, nights, minNights, fetchPriceQuote, clearPriceQuote])

  const handleBook = async () => {
    if (!user) {
      router.push(`/${locale}/auth/login`)
      return
    }
    if (!checkIn || !checkOut || nights < minNights) {
      setError(isAr ? 'حدد التواريخ أولاً' : 'Veuillez choisir les dates')
      return
    }
    setError('')
    setLoading(true)
    try {
      const booking = await createBooking({
        property_id:    property.id,
        check_in_date:  format(checkIn,  'yyyy-MM-dd'),
        check_out_date: format(checkOut, 'yyyy-MM-dd'),
        adults:         guests,
      })
      router.push(`/${locale}/client/bookings/${booking.id}/confirm`)
    } catch (e: any) {
      setError(e?.response?.data?.message || (isAr ? 'فشل الحجز' : 'Échec de la réservation'))
    } finally {
      setLoading(false)
    }
  }

  const quote = priceQuote

  return (
    <div className="bg-card rounded-3xl shadow-property border border-border p-6 space-y-5">

      {/* Price header */}
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(priceNight, currency)}
        </span>
        <span className="text-muted-foreground text-sm pb-0.5">/ {isAr ? 'ليلة' : 'nuit'}</span>
        {ratingCount > 0 && (
          <div className="flex items-center gap-1 ms-auto text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{ratingAvg.toFixed(1)}</span>
            <span className="text-muted-foreground">({ratingCount})</span>
          </div>
        )}
      </div>

      {/* Date picker trigger */}
      <div
        className="border-2 border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={() => setShowCal(!showCal)}
      >
        <div className="grid grid-cols-2 divide-x divide-border rtl:divide-x-reverse">
          <div className="p-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-0.5">
              {isAr ? 'الوصول' : 'Arrivée'}
            </p>
            <p className="text-sm text-muted-foreground">
              {checkIn ? formatDateShort(checkIn, locale) : (isAr ? 'اختر تاريخ' : 'Choisir')}
            </p>
          </div>
          <div className="p-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-0.5">
              {isAr ? 'المغادرة' : 'Départ'}
            </p>
            <p className="text-sm text-muted-foreground">
              {checkOut ? formatDateShort(checkOut, locale) : (isAr ? 'اختر تاريخ' : 'Choisir')}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {showCal && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border rounded-2xl overflow-hidden"
        >
          <DayPicker
            mode="range"
            selected={{ from: checkIn, to: checkOut }}
            onSelect={r => setRange({ from: r?.from, to: r?.to })}
            disabled={[{ before: addDays(new Date(), 1) }, ...blocked]}
            locale={isAr ? arLocale : frLocale}
            numberOfMonths={1}
            className="p-3 !font-sans"
          />
        </motion.div>
      )}

      {/* Guests counter */}
      <div className="flex items-center justify-between p-3 border border-border rounded-2xl">
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {isAr ? 'الضيوف' : 'Voyageurs'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr ? `الحد الأقصى ${maxGuests}` : `Max ${maxGuests}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuests(g => Math.max(1, g - 1))}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
            disabled={guests <= 1}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-semibold text-foreground w-4 text-center">{guests}</span>
          <button
            onClick={() => setGuests(g => Math.min(maxGuests, g + 1))}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
            disabled={guests >= maxGuests}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      {quote && nights > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2.5 pt-1"
        >
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {formatPrice(quote.price_per_night, currency)} × {nights} {isAr ? 'ليالٍ' : 'nuits'}
            </span>
            <span>{formatPrice(quote.base_price, currency)}</span>
          </div>
          {quote.cleaning_fee > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{isAr ? 'رسوم التنظيف' : 'Frais de ménage'}</span>
              <span>{formatPrice(quote.cleaning_fee, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{isAr ? 'رسوم الخدمة (10%)' : 'Frais de service (10%)'}</span>
            <span>{formatPrice(quote.service_fee, currency)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-semibold text-foreground">
            <span>{isAr ? 'المجموع' : 'Total'}</span>
            <span>{formatPrice(quote.total, currency)}</span>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <p className="text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2 border border-destructive/20">
          {error}
        </p>
      )}

      {/* Min nights notice */}
      {minNights > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          {isAr ? `الإقامة الدنيا ${minNights} ليالٍ` : `Durée minimale ${minNights} nuits`}
        </p>
      )}

      {/* CTA button */}
      <button
        onClick={handleBook}
        disabled={loading || bookingLoading}
        className={cn(
          'w-full h-12 rounded-2xl font-semibold text-white transition-all',
          'bg-gradient-brand shadow-glow-blue hover:opacity-90',
          'disabled:opacity-60 disabled:cursor-not-allowed'
        )}
      >
        {loading || bookingLoading ? (
          isAr ? 'جارٍ المعالجة...' : 'Traitement...'
        ) : isInstant ? (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            {isAr ? 'احجز الآن' : 'Réserver'}
          </span>
        ) : (
          isAr ? 'طلب الحجز' : 'Demander une réservation'
        )}
      </button>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        {isAr ? 'لن يتم خصم أي مبلغ الآن' : 'Aucun paiement maintenant'}
      </div>
    </div>
  )
}
