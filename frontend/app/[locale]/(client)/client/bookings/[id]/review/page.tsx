'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Star, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api/client'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { cn } from '@/lib/utils'

const CRITERIA = [
  { key: 'cleanliness',  label: { ar: 'النظافة',       fr: 'Propreté' } },
  { key: 'accuracy',     label: { ar: 'الدقة',          fr: 'Précision' } },
  { key: 'communication',label: { ar: 'التواصل',        fr: 'Communication' } },
  { key: 'location',     label: { ar: 'الموقع',         fr: 'Emplacement' } },
  { key: 'value',        label: { ar: 'القيمة مقابل السعر', fr: 'Rapport qualité/prix' } },
]

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg' }) {
  const [hovered, setHovered] = useState(0)
  const sz = size === 'lg' ? 'w-9 h-9' : size === 'md' ? 'w-7 h-7' : 'w-5 h-5'

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={cn('transition-transform', onChange && 'hover:scale-110 cursor-pointer', !onChange && 'cursor-default')}
        >
          <Star className={cn(sz, 'transition-colors',
            star <= (hovered || value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          )} />
        </button>
      ))}
    </div>
  )
}

export default function LeaveReviewPage() {
  const { id }   = useParams<{ id: string }>()
  const locale   = useLocale()
  const router   = useRouter()
  const ar       = locale === 'ar'

  const { currentBooking, fetchBooking } = useBookingStore()
  const [overall,  setOverall]  = useState(5)
  const [ratings,  setRatings]  = useState<Record<string, number>>(
    Object.fromEntries(CRITERIA.map(c => [c.key, 5]))
  )
  const [comment,  setComment]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => { fetchBooking(id) }, [id, fetchBooking])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      setError(ar ? 'يرجى كتابة تعليقك' : 'Veuillez écrire votre commentaire')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/bookings/${id}/review`, {
        rating_overall:       overall,
        comment_ar:           comment.trim(),
        rating_cleanliness:   ratings.cleanliness,
        rating_accuracy:      ratings.accuracy,
        rating_communication: ratings.communication,
        rating_location:      ratings.location,
        rating_value:         ratings.value,
      })
      setSubmitted(true)
      setTimeout(() => router.push(`/${locale}/client/bookings`), 2500)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'حدث خطأ، حاول مجدداً' : 'Une erreur est survenue'))
    } finally {
      setSubmitting(false)
    }
  }

  const b = currentBooking
  const title = ar ? b?.property?.title?.ar : (b?.property?.title?.fr || b?.property?.title?.ar)

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-24 text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {ar ? 'شكراً على تقييمك!' : 'Merci pour votre avis !'}
        </h2>
        <p className="text-muted-foreground">
          {ar ? 'تقييمك سيساعد المسافرين الآخرين' : 'Votre avis aide les autres voyageurs'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className={cn('w-4 h-4', ar && 'rotate-180')} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{ar ? 'قيّم إقامتك' : 'Évaluer votre séjour'}</h1>
          {title && <p className="text-muted-foreground text-sm mt-0.5 truncate">{title}</p>}
        </div>
      </div>

      {/* Property mini-card */}
      {b?.property?.cover_image && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            <Image src={b.property.cover_image} alt={title || ''} width={64} height={64} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{b.property.address}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Overall rating */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            {ar ? 'ما هو تقييمك العام لهذه الإقامة؟' : 'Quelle est votre note globale pour ce séjour ?'}
          </p>
          <div className="flex justify-center mb-3">
            <StarRating value={overall} onChange={setOverall} size="lg" />
          </div>
          <p className="text-3xl font-bold text-foreground">{overall}<span className="text-muted-foreground text-lg font-normal">/5</span></p>
          <p className="text-sm text-muted-foreground mt-1">
            {overall === 5 ? (ar ? 'ممتاز' : 'Excellent')
             : overall === 4 ? (ar ? 'جيد جداً' : 'Très bien')
             : overall === 3 ? (ar ? 'جيد' : 'Bien')
             : overall === 2 ? (ar ? 'مقبول' : 'Passable')
             : (ar ? 'ضعيف' : 'Mauvais')}
          </p>
        </motion.div>

        {/* Criteria ratings */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">{ar ? 'تقييم التفاصيل' : 'Critères détaillés'}</h3>
          {CRITERIA.map(c => (
            <div key={c.key} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{c.label[locale as 'ar' | 'fr']}</span>
              <StarRating value={ratings[c.key]} onChange={v => setRatings(r => ({ ...r, [c.key]: v }))} size="sm" />
            </div>
          ))}
        </motion.div>

        {/* Comment */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-5">
          <label className="block font-semibold text-foreground text-sm mb-3">
            {ar ? 'اكتب تعليقك' : 'Votre commentaire'}
            <span className="text-destructive ms-1">*</span>
          </label>
          <textarea
            rows={5}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={ar
              ? 'شاركنا تجربتك... ما الذي أعجبك؟ ما الذي يمكن تحسينه؟'
              : 'Partagez votre expérience... Qu\'avez-vous aimé ? Que peut-on améliorer ?'}
            className={cn(
              'w-full bg-muted rounded-xl border text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none',
              error ? 'border-destructive' : 'border-border'
            )}
          />
          <div className="flex items-center justify-between mt-1.5">
            {error
              ? <p className="text-destructive text-xs">{error}</p>
              : <span />
            }
            <span className={cn('text-xs', comment.length < 20 ? 'text-muted-foreground' : 'text-green-500')}>
              {comment.length}/500
            </span>
          </div>
        </motion.div>

        <button type="submit" disabled={submitting}
          className="w-full h-12 bg-gradient-brand text-white rounded-2xl text-sm font-semibold shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {submitting ? (ar ? 'جارٍ الإرسال...' : 'Envoi en cours...') : (ar ? 'إرسال التقييم' : 'Envoyer l\'avis')}
        </button>
      </form>
    </div>
  )
}
