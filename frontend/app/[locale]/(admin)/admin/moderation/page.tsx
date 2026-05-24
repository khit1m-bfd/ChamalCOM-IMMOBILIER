'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Eye, MapPin, BedDouble, Users, Clock, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatDate, cn } from '@/lib/utils'

interface PendingProperty {
  id: string
  title: { ar: string; fr?: string }
  location: { city: string; region?: string }
  capacity: { bedrooms: number; max_guests: number }
  pricing: { per_night: number; currency: string }
  cover_image?: string
  created_at: string
  owner?: { name: string; email: string; avatar?: string }
}

export default function AdminModerationPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [properties, setProperties] = useState<PendingProperty[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [acting,     setActing]     = useState<string | null>(null)
  const [actionMsg,  setActionMsg]  = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [rejectId,   setRejectId]   = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await api.get('/admin/properties/pending')
      setProperties(result.data || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    setActing(id)
    setActionMsg(null)
    try {
      await api.patch(`/admin/properties/${id}/approve`, { action, reason })
      setProperties(ps => ps.filter(p => p.id !== id))
      setRejectId(null)
      setRejectReason('')
      setActionMsg({
        type: 'success',
        text: action === 'approve'
          ? (ar ? 'تم قبول العقار ونشره' : 'Propriété approuvée et publiée')
          : (ar ? 'تم رفض العقار' : 'Propriété refusée'),
      })
    } catch (e: any) {
      setActionMsg({
        type: 'error',
        text: e?.response?.data?.message || (ar ? 'فشلت العملية' : 'Opération échouée'),
      })
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {ar ? 'مراجعة العقارات' : 'Modération des propriétés'}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {ar ? 'مراجعة وقبول أو رفض العقارات المعلقة' : 'Examinez et approuvez ou refusez les propriétés en attente'}
        </p>
      </div>

      {/* Feedback */}
      {actionMsg && (
        <div className={cn(
          'px-4 py-2.5 rounded-xl text-sm border flex items-center justify-between',
          actionMsg.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 border-green-200 dark:border-green-800'
            : 'bg-destructive/10 text-destructive border-destructive/20'
        )}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="ms-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">{ar ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}</p>
          <button onClick={load} className="text-primary text-sm font-semibold hover:underline">
            {ar ? 'إعادة المحاولة' : 'Réessayer'}
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {ar ? 'لا توجد عقارات بانتظار المراجعة' : 'Aucune propriété en attente'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {ar ? 'جميع العقارات تمت مراجعتها' : 'Toutes les propriétés ont été examinées'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-orange-500">{properties.length}</span>{' '}
            {ar ? 'عقار ينتظر المراجعة' : 'propriété(s) en attente de modération'}
          </p>

          {properties.map((property, i) => {
            const title = ar ? property.title?.ar : (property.title?.fr || property.title?.ar)

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="flex gap-4 p-5">
                  {/* Cover */}
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {property.cover_image ? (
                      <Image src={property.cover_image} alt={title || ''} width={112} height={112} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">🏡</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-orange-500 bg-orange-50 dark:bg-orange-900/20">
                        <Clock className="w-3 h-3" />
                        {ar ? 'قيد الانتظار' : 'En attente'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.location?.city}
                        {property.location?.region && `, ${property.location.region}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3" />
                        {property.capacity?.bedrooms} {ar ? 'غرف' : 'ch.'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ar ? 'حتى' : 'max'} {property.capacity?.max_guests}
                      </span>
                    </div>

                    {property.owner && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {ar ? 'المضيف:' : 'Hôte:'}{' '}
                        <span className="text-foreground font-medium">{property.owner.name}</span>
                        {' — '}{property.owner.email}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {ar ? 'أُرسل في:' : 'Soumis le:'} {formatDate(property.created_at, locale)}
                    </p>
                  </div>
                </div>

                {/* Reject input */}
                {rejectId === property.id && (
                  <div className="px-5 pb-4 space-y-2">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder={ar ? 'سبب الرفض (اختياري)' : 'Motif du refus (optionnel)'}
                      className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      autoFocus
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 pb-5 flex flex-wrap gap-2">
                  <Link
                    href={`/${locale}/properties/${property.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {ar ? 'معاينة' : 'Aperçu'}
                  </Link>

                  {rejectId === property.id ? (
                    <>
                      <button
                        onClick={() => handleAction(property.id, 'reject', rejectReason)}
                        disabled={acting === property.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-destructive text-white text-sm font-semibold rounded-xl hover:bg-destructive/90 transition-colors disabled:opacity-50"
                      >
                        {acting === property.id ? '...' : (ar ? 'تأكيد الرفض' : 'Confirmer le refus')}
                      </button>
                      <button
                        onClick={() => { setRejectId(null); setRejectReason('') }}
                        className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-xl hover:bg-muted/80 transition-colors"
                      >
                        {ar ? 'إلغاء' : 'Annuler'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(property.id, 'approve')}
                        disabled={acting === property.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {acting === property.id ? '...' : (ar ? 'قبول ونشر' : 'Approuver')}
                      </button>
                      <button
                        onClick={() => setRejectId(property.id)}
                        disabled={acting === property.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-destructive/10 text-destructive text-sm font-semibold rounded-xl border border-destructive/20 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {ar ? 'رفض' : 'Refuser'}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
