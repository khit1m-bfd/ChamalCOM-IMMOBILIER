'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { CreditCard, Shield, Lock, CheckCircle, ChevronRight, Banknote } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { api } from '@/lib/api/client'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'

export default function PaymentPage() {
  const { id }     = useParams<{ id: string }>()
  const locale     = useLocale()
  const router     = useRouter()
  const ar         = locale === 'ar'

  const { currentBooking, fetchBooking, loading } = useBookingStore()
  const [paying,   setPaying]   = useState(false)
  const [paid,     setPaid]     = useState(false)
  const [error,    setError]    = useState('')
  const [method,   setMethod]   = useState<'card' | 'cash'>('card')

  useEffect(() => { fetchBooking(id) }, [id, fetchBooking])

  const booking = currentBooking

  const handlePay = async () => {
    if (!booking) return
    setPaying(true)
    setError('')
    try {
      await api.post(`/payments/demo-confirm/${booking.id}`)
      setPaid(true)
      setTimeout(() => {
        router.push(`/${locale}/client/bookings/${booking.id}/confirm`)
      }, 2000)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'فشل الدفع' : 'Échec du paiement'))
    } finally {
      setPaying(false)
    }
  }

  if (loading || !booking) {
    return (
      <div className="page-container py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const nights   = booking.dates?.nights ?? 0
  const currency = booking.pricing?.currency ?? 'MAD'
  const total    = booking.pricing?.total ?? 0
  const title    = ar
    ? (booking.property?.title?.ar ?? '')
    : (booking.property?.title?.fr ?? booking.property?.title?.ar ?? '')

  if (paid) {
    return (
      <div className="page-container py-20 flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground">
          {ar ? 'تم الدفع بنجاح!' : 'Paiement confirmé !'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {ar ? 'جارٍ التحويل...' : 'Redirection en cours...'}
        </p>
      </div>
    )
  }

  return (
    <div className="page-container py-10 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {ar ? 'إتمام الدفع' : 'Finaliser le paiement'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {ar ? 'دفع آمن ومشفر' : 'Paiement sécurisé et crypté'}
          </p>
        </div>

        {/* Booking summary */}
        <div className="bg-card rounded-3xl border border-border p-5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {ar ? 'ملخص الحجز' : 'Résumé de la réservation'}
          </p>

          {booking.property && (
            <div className="flex gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {booking.property.cover_image ? (
                  <Image
                    src={booking.property.cover_image}
                    alt={title}
                    width={56} height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{booking.property.address}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {formatDate(booking.dates?.check_in, locale)} → {formatDate(booking.dates?.check_out, locale)}
                  {' · '}{nights} {ar ? 'ليالٍ' : 'nuits'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm">
            {(booking.pricing?.base_price ?? 0) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {formatPrice((booking.pricing?.base_price ?? 0) / (nights || 1), currency)}
                  {' × '}{nights} {ar ? 'ليالٍ' : 'nuits'}
                </span>
                <span>{formatPrice(booking.pricing?.base_price ?? 0, currency)}</span>
              </div>
            )}
            {(booking.pricing?.cleaning_fee ?? 0) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{ar ? 'رسوم التنظيف' : 'Frais de ménage'}</span>
                <span>{formatPrice(booking.pricing?.cleaning_fee ?? 0, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>{ar ? 'رسوم الخدمة' : 'Frais de service'}</span>
              <span>{formatPrice(booking.pricing?.service_fee ?? 0, currency)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-bold text-foreground text-base">
              <span>{ar ? 'المجموع الكلي' : 'Total à payer'}</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-card rounded-3xl border border-border p-5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {ar ? 'طريقة الدفع' : 'Mode de paiement'}
          </p>

          <div className="space-y-2">
            {[
              { key: 'card' as const, icon: CreditCard, label: ar ? 'بطاقة بنكية (تجريبي)' : 'Carte bancaire (démo)' },
              { key: 'cash' as const, icon: Banknote,   label: ar ? 'دفع عند الوصول'        : 'Paiement à l\'arrivée' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setMethod(key)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-colors ${
                  method === key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  method === key ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <Icon className={`w-5 h-5 ${method === key ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`font-medium text-sm ${method === key ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {method === key && (
                  <CheckCircle className="w-4 h-4 text-primary ms-auto" />
                )}
              </button>
            ))}
          </div>

          {method === 'card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-2xl bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                <span>{ar ? 'وضع تجريبي — لا يوجد خصم حقيقي' : 'Mode démo — aucun débit réel'}</span>
              </div>
              <div className="space-y-2.5">
                <input
                  disabled
                  defaultValue="4242 4242 4242 4242"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono text-muted-foreground"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input disabled defaultValue="12/27" className="h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono text-muted-foreground" />
                  <input disabled defaultValue="123" className="h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-destructive text-sm bg-destructive/10 rounded-2xl px-4 py-3 border border-destructive/20">
            {error}
          </p>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full h-14 bg-gradient-brand text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed text-base"
        >
          {paying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {ar ? 'جارٍ المعالجة...' : 'Traitement...'}
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              {ar ? `ادفع ${formatPrice(total, currency)}` : `Payer ${formatPrice(total, currency)}`}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          {ar
            ? 'بالنقر فوق "ادفع" فأنت توافق على شروط الاستخدام وسياسة الإلغاء'
            : 'En cliquant sur "Payer" vous acceptez les conditions et la politique d\'annulation'}
        </p>
      </motion.div>
    </div>
  )
}
