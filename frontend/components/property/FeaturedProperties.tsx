'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Heart, Star, MapPin, Users, BedDouble, Bath, Zap, ArrowRight, ArrowLeft } from 'lucide-react'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { PropertySkeleton } from './PropertySkeleton'
import { cn } from '@/lib/utils'

export function FeaturedProperties() {
  const t       = useTranslations()
  const locale  = useLocale()
  const { featured, fetchFeatured, toggleFavorite, loading } = usePropertyStore()

  useEffect(() => { fetchFeatured() }, [fetchFeatured])

  const ArrowIcon = locale === 'ar' ? ArrowLeft : ArrowRight

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="page-container">

        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-semibold tracking-wider uppercase block mb-2">
              {locale === 'ar' ? 'مختارة بعناية' : 'Sélection curatée'}
            </span>
            <h2 className="section-title">
              {locale === 'ar' ? 'أفضل العقارات المميزة' : 'Logements en vedette'}
            </h2>
            <p className="section-subtitle mt-2">
              {locale === 'ar'
                ? 'اكتشف أجمل الإقامات المختارة من قبل فريقنا في وادي لاو'
                : 'Découvrez les plus beaux séjours sélectionnés par notre équipe'
              }
            </p>
          </motion.div>

          <Link
            href={`/${locale}/properties`}
            className="hidden md:flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            {t('common.seeAll')}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <PropertySkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(featured || []).map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                onToggleFavorite={() => toggleFavorite(property.id)}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Mobile See All */}
        <div className="mt-10 text-center md:hidden">
          <Link href={`/${locale}/properties`} className="btn-outline inline-flex items-center gap-2">
            {t('common.seeAll')}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

interface PropertyCardProps {
  property: any
  index: number
  onToggleFavorite: () => void
  locale: string
  t: any
}

function PropertyCard({ property, index, onToggleFavorite, locale, t }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const title = locale === 'ar' ? property.title?.ar : (property.title?.fr || property.title?.ar)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="property-card group cursor-pointer"
    >
      <Link href={`/${locale}/properties/${property.id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <Image
              src={property.cover_image || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
              alt={title || ''}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </motion.div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 start-3 flex gap-2">
            {property.is_featured && (
              <span className="badge-featured text-[10px]">
                <Star className="w-2.5 h-2.5 fill-white" />
                {t('common.featured')}
              </span>
            )}
            {property.rules?.instant_booking && (
              <span className="inline-flex items-center gap-1 bg-secondary text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                <Zap className="w-2.5 h-2.5" />
                {locale === 'ar' ? 'فوري' : 'Instantané'}
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); onToggleFavorite() }}
            className="absolute top-3 end-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <Heart className={cn('w-4 h-4 transition-colors', property.is_favorited ? 'fill-red-500 text-red-500' : 'text-slate-600')} />
          </motion.button>

          {/* Rating on image */}
          <div className="absolute bottom-3 start-3 flex items-center gap-1 glass-dark rounded-full px-2 py-1">
            <Star className="w-3 h-3 fill-sand-400 text-sand-400" />
            <span className="text-white text-xs font-semibold">{property.stats?.rating_average || '4.8'}</span>
            <span className="text-white/60 text-xs">({property.stats?.rating_count || 0})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1.5">
            <MapPin className="w-3 h-3" />
            <span>{property.location?.city || 'وادي لاو'}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground text-sm leading-snug truncate-2 mb-2">
            {title}
          </h3>

          {/* Capacity */}
          <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />
              {property.capacity?.bedrooms} {t('common.bedrooms')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {property.capacity?.max_guests} {t('common.guests')}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-foreground text-base">
                {property.pricing?.per_night?.toLocaleString()} {t('common.currency')}
              </span>
              <span className="text-muted-foreground text-xs"> {t('common.perNight')}</span>
            </div>
            <motion.div
              animate={{ x: isHovered ? (locale === 'ar' ? -4 : 4) : 0 }}
              className="text-primary"
            >
              {locale === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
