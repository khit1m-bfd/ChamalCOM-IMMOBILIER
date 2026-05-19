'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Heart, Star, MapPin, Zap, Users, BedDouble } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { type Property } from '@/lib/stores/propertyStore'
import { formatPrice, cn } from '@/lib/utils'

interface Props {
  property: Property
  className?: string
}

export function PropertyCard({ property, className }: Props) {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { user } = useAuthStore()
  const { toggleFavorite } = usePropertyStore()

  // Backend returns nested `images` with `is_cover` (not `is_primary`)
  const coverImage = property.cover_image
    || property.images?.find(i => i.is_cover)?.url
    || property.images?.[0]?.url

  // Backend returns `title: { ar, fr }`
  const title = ar
    ? property.title?.ar
    : (property.title?.fr || property.title?.ar)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    await toggleFavorite(property.id)
  }

  return (
    <Link href={`/${locale}/properties/${property.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn('group bg-card rounded-3xl overflow-hidden shadow-card-hover hover:shadow-property transition-shadow cursor-pointer', className)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title || ''}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-4xl">🏡</span>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Instant booking badge — backend: rules.instant_booking */}
          {property.rules?.instant_booking && (
            <div className="absolute top-3 start-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {ar ? 'حجز فوري' : 'Réservation instant'}
            </div>
          )}

          {/* Favorite button */}
          {user && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 end-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            >
              <Heart
                className={cn('w-4 h-4 transition-colors', property.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-600')}
              />
            </button>
          )}

          {/* Rating overlay — backend: stats.rating_average / stats.rating_count */}
          {(property.stats?.rating_count ?? 0) > 0 && (
            <div className="absolute bottom-3 end-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {property.stats.rating_average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1">
              {title}
            </h3>
          </div>

          {/* Location — backend: location.city */}
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{property.location?.city}</span>
          </div>

          {/* Capacity — backend: capacity.bedrooms / capacity.max_guests */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3 h-3" />
              {property.capacity?.bedrooms} {ar ? 'غرف' : 'ch.'}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {property.capacity?.max_guests} {ar ? 'ضيوف' : 'pers.'}
            </span>
          </div>

          {/* Price — backend: pricing.per_night / pricing.currency */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-foreground text-base">
                {formatPrice(property.pricing?.per_night ?? 0, property.pricing?.currency ?? 'MAD')}
              </span>
              <span className="text-muted-foreground text-xs ms-1">
                / {ar ? 'ليلة' : 'nuit'}
              </span>
            </div>
            {(property.stats?.rating_count ?? 0) > 0 && (
              <span className="text-muted-foreground text-xs">
                ({property.stats.rating_count} {ar ? 'تقييم' : 'avis'})
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
