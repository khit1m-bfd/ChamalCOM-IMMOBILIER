'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Calendar, Users, MapPin, Star, CheckCircle,
  XCircle, Clock, Home, MessageSquare, Phone, Shield,
} from 'lucide-react'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { formatPrice, formatDate, cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: { ar: string; fr: string } }> = {
  pending:   { color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200',  icon: Clock,         label: { ar: 'قيد الانتظار', fr: 'En attente' } },
  confirmed: { color: 'text-green-500  bg-green-50  dark:bg-green-900/20  border-green-200',   icon: CheckCircle,   label: { ar: 'مؤكد',         fr: 'Confirmé' } },
  cancelled: { color: 'text-red-500    bg-red-50    dark:bg-red-900/20    border-red-200',     icon: XCircle,       label: { ar: 'ملغى',         fr: 'Annulé' } },
  completed: { color: 'text-blue-500   bg-blue-50   dark:bg-blue-900/20   border-blue-200',    icon: CheckCircle,   label: { ar: 'مكتمل',        fr: 'Terminé' } },
  rejected:  { color: 'text-gray-500   bg-gray-50   dark:bg-gray-900/20   border-gray-200',    icon: XCircle,       label: { ar: 'مرفوض',        fr: 'Refusé' } },
}

export default function BookingDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const locale   = useLocale()
  const router   = useRouter()
  const ar       = locale === 'ar'
  const { currentBooking, fetchBooking, cancelBooking, loading } = useBookingStore()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling,    setCancelling]    = useState(false)
  const [cancelError,   setCancelError]   = useState('')

  useEffect(() => { fetchBooking(id) }, [id, fetchBooking])

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse max-w-2xl mx-auto">
        <div className="h-8 bg-muted rounded-xl w-48" />
        <div className="h-52 bg-muted rounded-2xl" />
        <div className="h-40 bg-muted rounded-2xl" />
        <div className="h-40 bg-muted rounded-2xl" />
      </div>
    )
  }

  const b = currentBooking
  if (!b) return (
    <div className="text-center py-20 text-muted-foreground max-w-2xl mx-auto">
      <Home className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p>{ar ? 'الحجز غير موجود' : 'Réservation introuvable'}</p>
    </div>
  )

  const sc      = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
  const SI      = sc.icon
  const nights  = b.dates?.nights ?? 0
  const currency = b.pricing?.currency ?? 'MAD'
  const title    = ar ? b.property?.title?.ar : (b.property?.title?.fr || b.property?.title?.ar)

  const handleCancel = async () => {
    setCancelling(true)
    setCancelError('')
    try {
      await cancelBooking(b.id, ar ? 'إلغاء من قبل العميل' : 'Annulation par le client')
      router.push(`/${locale}/client/bookings`)
    } catch (e: any) {
      setCancelError(e?.response?.data?.message || (ar ? 'فشل الإلغاء' : 'Échec de l\'annulation'))
      setConfirmCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Back + reference */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className={cn('w-4 h-4', ar && 'rotate-180')} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{ar ? 'تفاصيل الحجز' : 'Détails de la réservation'}</h1>
          <p className="text-xs font-mono text-muted-foreground">{b.reference}</p>
        </div>
        <span className={cn('ms-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border', sc.color)}>
          <SI className="w-3.5 h-3.5" />
          {sc.label[locale as 'ar' | 'fr']}
        </span>
      </div>

      {/* Property card */}
      {b.property && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="relative h-44">
            {b.property.cover_image
              ? <Image src={b.property.cover_image} alt={title || ''} fill className="object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl">🏡</div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 start-4 end-4">
              <p className="font-bold text-white text-lg leading-tight">{title}</p>
              {b.property.address && (
                <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />{b.property.address}
                </p>
              )}
            </div>
          </div>
          <div className="p-4">
            <Link href={`/${locale}/properties/${b.property.id}`}
              className="text-primary text-sm font-medium hover:underline">
              {ar ? 'عرض العقار ←' : 'Voir la propriété →'}
            </Link>
          </div>
        </motion.div>
      )}

      {/* Dates & guests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          {ar ? 'تفاصيل الإقامة' : 'Séjour'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Calendar, label: ar ? 'تاريخ الوصول' : 'Arrivée',     value: formatDate(b.dates?.check_in, locale) },
            { icon: Calendar, label: ar ? 'تاريخ المغادرة' : 'Départ',   value: formatDate(b.dates?.check_out, locale) },
            { icon: Clock,    label: ar ? 'عدد الليالي' : 'Nuits',        value: `${nights}` },
            { icon: Users,    label: ar ? 'عدد الضيوف' : 'Voyageurs',     value: `${b.guests?.total ?? 0}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-muted/50 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold text-foreground text-sm mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
        {b.messages?.guest && (
          <div className="mt-4 p-3 bg-muted/40 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">{ar ? 'طلباتك الخاصة' : 'Demandes spéciales'}</p>
            <p className="text-sm text-foreground">{b.messages.guest}</p>
          </div>
        )}
      </motion.div>

      {/* Price breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          {ar ? 'تفاصيل السعر' : 'Détail du prix'}
        </h2>
        <Row label={`${formatPrice(Math.round((b.pricing?.base_price ?? 0) / Math.max(1, nights)), currency)} × ${nights} ${ar ? 'ليالٍ' : 'nuits'}`}
             value={formatPrice(b.pricing?.base_price ?? 0, currency)} />
        {(b.pricing?.cleaning_fee ?? 0) > 0 && (
          <Row label={ar ? 'رسوم التنظيف' : 'Frais de ménage'}
               value={formatPrice(b.pricing?.cleaning_fee ?? 0, currency)} />
        )}
        {(b.pricing?.service_fee ?? 0) > 0 && (
          <Row label={ar ? 'رسوم الخدمة' : 'Frais de service'}
               value={formatPrice(b.pricing?.service_fee ?? 0, currency)} />
        )}
        {(b.pricing?.security_deposit ?? 0) > 0 && (
          <Row label={ar ? 'تأمين قابل للاسترداد' : 'Dépôt de garantie'}
               value={formatPrice(b.pricing?.security_deposit ?? 0, currency)} />
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
          <span className="font-bold text-foreground">{ar ? 'المجموع' : 'Total'}</span>
          <span className="font-bold text-foreground text-lg">{formatPrice(b.pricing?.total ?? 0, currency)}</span>
        </div>
        {b.cancellation?.refund && b.cancellation.refund > 0 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 text-sm">
            {ar ? `المبلغ المسترد: ${formatPrice(b.cancellation.refund, currency)}` : `Remboursement: ${formatPrice(b.cancellation.refund, currency)}`}
          </div>
        )}
      </motion.div>

      {/* Owner info */}
      {b.owner && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            {ar ? 'المضيف' : 'Hôte'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
              {b.owner.avatar
                ? <Image src={b.owner.avatar} alt={b.owner.name} width={48} height={48} className="object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">{b.owner.name?.[0]}</div>
              }
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{b.owner.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Shield className="w-3 h-3 text-primary" />
                <span>{ar ? 'مضيف موثّق' : 'Hôte vérifié'}</span>
              </div>
            </div>
            <Link href={`/${locale}/client/messages`}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-xl hover:bg-primary/20 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              {ar ? 'تواصل' : 'Contacter'}
            </Link>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="flex flex-col gap-3 pb-4">
        {cancelError && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 border border-destructive/20">
            {cancelError}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {b.can_review && b.status === 'completed' && (
            <Link href={`/${locale}/client/bookings/${b.id}/review`}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-2xl hover:bg-primary/90 transition-colors shadow-glow-blue">
              <Star className="w-4 h-4" />
              {ar ? 'قيّم إقامتك' : 'Laisser un avis'}
            </Link>
          )}
          {b.can_cancel && (
            confirmCancel ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-destructive font-medium">
                  {ar ? 'تأكيد إلغاء الحجز؟' : 'Confirmer l\'annulation ?'}
                </span>
                <button onClick={handleCancel} disabled={cancelling}
                  className="px-4 py-2 bg-destructive text-white text-sm font-semibold rounded-2xl hover:bg-destructive/90 transition-colors disabled:opacity-60">
                  {cancelling ? (ar ? 'جارٍ...' : '...') : (ar ? 'تأكيد' : 'Confirmer')}
                </button>
                <button onClick={() => setConfirmCancel(false)} disabled={cancelling}
                  className="px-4 py-2 border border-border text-sm font-medium rounded-2xl hover:bg-muted transition-colors">
                  {ar ? 'إلغاء' : 'Annuler'}
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-2 px-5 py-2.5 border border-destructive/30 text-destructive text-sm font-semibold rounded-2xl hover:bg-destructive/10 transition-colors">
                <XCircle className="w-4 h-4" />
                {ar ? 'إلغاء الحجز' : 'Annuler la réservation'}
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  )
}
