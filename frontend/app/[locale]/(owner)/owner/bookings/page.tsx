'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Calendar, MapPin, Users, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatPrice, formatDate, nightsBetween, cn } from '@/lib/utils'

interface Booking {
  id: string
  reference: string
  status: string
  payment_status: string
  created_at: string
  dates: { check_in: string; check_out: string; nights: number }
  guests: { total: number }
  pricing: { total: number; currency: string }
  guest: { id: string; name: string; avatar?: string; email: string }
  property: { id: string; title: { ar: string; fr?: string }; cover_image?: string }
}

const STATUS = {
  pending:   { color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200', label: { ar: 'قيد الانتظار', fr: 'En attente' } },
  confirmed: { color: 'text-green-500  bg-green-50  dark:bg-green-900/20  border-green-200',  label: { ar: 'مؤكد',         fr: 'Confirmé' } },
  cancelled: { color: 'text-red-500    bg-red-50    dark:bg-red-900/20    border-red-200',    label: { ar: 'ملغى',         fr: 'Annulé' } },
  completed: { color: 'text-blue-500   bg-blue-50   dark:bg-blue-900/20   border-blue-200',   label: { ar: 'مكتمل',        fr: 'Terminé' } },
  rejected:  { color: 'text-gray-500   bg-gray-50   dark:bg-gray-900/20   border-gray-200',   label: { ar: 'مرفوض',        fr: 'Refusé' } },
}

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const

export default function OwnerBookingsPage() {
  const locale       = useLocale()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const ar           = locale === 'ar'

  const [bookings,    setBookings]    = useState<Booking[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(false)
  const [acting,      setActing]      = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectId,    setRejectId]    = useState<string | null>(null)
  const [rejectReason,setRejectReason]= useState('')
  const activeStatus = searchParams.get('status') || 'all'

  const fetchBookings = async () => {
    setLoading(true)
    setError(false)
    try {
      const params: any = { per_page: 20 }
      if (activeStatus !== 'all') params.status = activeStatus
      // Backend: { success: true, data: { items: Booking[], pagination: {...} } }
      const { data } = await api.get('/owner/bookings', { params })
      setBookings(data.items || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [activeStatus])

  const handleAction = async (id: string, action: 'confirm' | 'reject', reason?: string) => {
    setActing(id)
    setActionError(null)
    try {
      await api.post(`/owner/bookings/${id}/${action}`, reason ? { reason } : {})
      setBookings(bs => bs.map(b => b.id === id
        ? { ...b, status: action === 'confirm' ? 'confirmed' : 'rejected' }
        : b
      ))
      setRejectId(null)
      setRejectReason('')
    } catch (e: any) {
      setActionError(e?.response?.data?.message || (ar ? 'حدث خطأ، حاول مجدداً' : 'Une erreur est survenue'))
    } finally {
      setActing(null)
    }
  }

  const setTab = (tab: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (tab === 'all') p.delete('status')
    else p.set('status', tab)
    router.push(`?${p.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'إدارة الحجوزات' : 'Gestion des réservations'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{ar ? 'راجع وأدر جميع حجوزات عقاراتك' : 'Consultez et gérez toutes vos réservations'}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap bg-muted rounded-xl p-1 w-fit">
        {TABS.map(tab => {
          const count = tab === 'all' ? bookings.length : bookings.filter(b => b.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeStatus === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'all' ? (ar ? 'الكل' : 'Tous') : STATUS[tab as keyof typeof STATUS]?.label[locale as 'ar' | 'fr']}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', activeStatus === tab ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {actionError && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-2.5 rounded-xl border border-destructive/20">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium mb-2">{ar ? 'خطأ في التحميل' : 'Erreur de chargement'}</p>
          <button onClick={fetchBookings} className="text-primary text-sm font-semibold hover:underline">
            {ar ? 'إعادة المحاولة' : 'Réessayer'}
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{ar ? 'لا توجد حجوزات' : 'Aucune réservation'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, i) => {
            const sc     = STATUS[booking.status as keyof typeof STATUS] || STATUS.pending
            const img    = booking.property.cover_image
            const title  = ar ? booking.property.title?.ar : (booking.property.title?.fr || booking.property.title?.ar)
            const nights = booking.dates?.nights ?? 0

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-5"
              >
                <div className="flex gap-4">
                  {/* Property image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {img && <Image src={img} alt={title || ''} width={80} height={80} className="w-full h-full object-cover" />}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{booking.reference}</p>
                        <Link href={`/${locale}/properties/${booking.property.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{title}</h3>
                        </Link>
                      </div>
                      <span className={cn('flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border', sc.color)}>
                        {sc.label[locale as 'ar' | 'fr']}
                      </span>
                    </div>

                    {/* Guest info */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {booking.guest.avatar
                          ? <Image src={booking.guest.avatar} alt={booking.guest.name} width={24} height={24} className="object-cover" />
                          : <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-[8px] font-bold">{booking.guest.name?.[0]}</div>
                        }
                      </div>
                      <p className="text-sm text-foreground font-medium">{booking.guest.name}</p>
                      <span className="text-muted-foreground text-xs">— {booking.guest.email}</span>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(booking.dates?.check_in, locale)} → {formatDate(booking.dates?.check_out, locale)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {booking.guests?.total} {ar ? 'ضيوف' : 'pers.'} · {nights} {ar ? 'ليالٍ' : 'nuits'}
                      </span>
                      <span className="font-semibold text-foreground ms-auto">
                        {formatPrice(booking.pricing?.total ?? 0, booking.pricing?.currency ?? 'MAD')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions for pending */}
                {booking.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {rejectId === booking.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder={ar ? 'سبب الرفض (اختياري)' : 'Motif du refus (optionnel)'}
                          className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(booking.id, 'reject', rejectReason)}
                            disabled={acting === booking.id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-destructive text-white text-sm font-semibold rounded-xl hover:bg-destructive/90 transition-colors disabled:opacity-50"
                          >
                            {acting === booking.id ? '...' : (ar ? 'تأكيد الرفض' : 'Confirmer le refus')}
                          </button>
                          <button
                            onClick={() => { setRejectId(null); setRejectReason('') }}
                            className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-xl hover:bg-muted/80 transition-colors"
                          >
                            {ar ? 'إلغاء' : 'Annuler'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(booking.id, 'confirm')}
                          disabled={acting === booking.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {acting === booking.id ? '...' : (ar ? 'قبول' : 'Confirmer')}
                        </button>
                        <button
                          onClick={() => setRejectId(booking.id)}
                          disabled={acting === booking.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-destructive/10 text-destructive text-sm font-semibold rounded-xl border border-destructive/20 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          {ar ? 'رفض' : 'Refuser'}
                        </button>
                        <Link
                          href={`/${locale}/owner/messages`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-xl hover:bg-muted/80 transition-colors ms-auto"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {ar ? 'تواصل' : 'Contacter'}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
