'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatDate, cn } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  guest: {
    id: string
    first_name: string
    last_name: string
    avatar?: string
  }
  reply?: {
    comment: string
    created_at: string
  }
}

interface Props {
  propertyId: string
  ratingAvg:  number
  ratingCount: number
}

export function ReviewsList({ propertyId, ratingAvg, ratingCount }: Props) {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/properties/${propertyId}/reviews`)
        setReviews(data.data || [])
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [propertyId])

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {ar ? 'التقييمات' : 'Avis'}
        </h2>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {ar ? 'التقييمات' : 'Avis'}
        </h2>
        {ratingCount > 0 && (
          <div className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{ratingAvg.toFixed(2)}</span>
            <span className="text-muted-foreground text-xs">({ratingCount})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {ar ? 'لا توجد تقييمات بعد' : 'Aucun avis pour le moment'}
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-muted overflow-hidden flex-shrink-0">
                  {review.guest.avatar ? (
                    <Image src={review.guest.avatar} alt={review.guest.first_name} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
                      {review.guest.first_name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground text-sm">
                      {review.guest.first_name} {review.guest.last_name}
                    </p>
                    <span className="text-muted-foreground text-xs">{formatDate(review.created_at, locale)}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={cn('w-3.5 h-3.5', j < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border')}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>

                  {/* Owner reply */}
                  {review.reply && (
                    <div className="mt-3 ms-4 ps-4 border-s-2 border-primary/30">
                      <p className="text-xs font-semibold text-primary mb-1">
                        {ar ? 'رد المضيف' : 'Réponse de l\'hôte'}
                      </p>
                      <p className="text-muted-foreground text-sm">{review.reply.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
