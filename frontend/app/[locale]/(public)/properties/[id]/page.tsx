'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Star, MapPin, Users, BedDouble, Bath, Heart, Share2,
  Wifi, Car, Wind, Waves, ChevronLeft, ChevronRight, CheckCircle, Zap,
} from 'lucide-react'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { BookingPanel } from '@/components/booking/BookingPanel'
import { PropertyMap } from '@/components/property/PropertyMap'
import { ReviewsList } from '@/components/review/ReviewsList'
import { formatPrice, cn } from '@/lib/utils'

export default function PropertyDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const locale   = useLocale()
  const router   = useRouter()
  const ar       = locale === 'ar'

  const { currentProperty: property, loading, fetchProperty, toggleFavorite } = usePropertyStore()
  const { user } = useAuthStore()

  const [activeImage, setActiveImage] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)

  useEffect(() => {
    fetchProperty(id)
  }, [id, fetchProperty])

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-[60vh] bg-muted rounded-3xl" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-muted rounded-xl w-3/4" />
              <div className="h-4 bg-muted rounded-xl w-1/2" />
            </div>
            <div className="h-96 bg-muted rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) return null

  // Backend PropertyResource uses nested objects
  const title   = ar ? property.title?.ar : (property.title?.fr || property.title?.ar)
  const desc    = ar ? property.description?.ar : (property.description?.fr || property.description?.ar)
  const images  = property.images || []
  // Backend uses `is_cover` not `is_primary`
  const sorted  = [...images].sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0))

  return (
    <div className="bg-background">
      {/* Gallery */}
      <div className="page-container pt-6">
        <div className="relative">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] rounded-3xl overflow-hidden">
            {sorted.slice(0, 5).map((img, i) => (
              <div
                key={img.id}
                className={cn(
                  'relative cursor-pointer overflow-hidden',
                  i === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
                )}
                onClick={() => setActiveImage(i)}
              >
                <Image
                  src={img.url}
                  alt={`${title} - ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={i === 0}
                />
                {i === 4 && images.length > 5 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAllImages(true) }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg"
                  >
                    +{images.length - 5} {ar ? 'صور' : 'photos'}
                  </button>
                )}
              </div>
            ))}
            {sorted.length === 0 && (
              <div className="col-span-4 row-span-2 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center rounded-3xl">
                <span className="text-8xl">🏡</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 end-4 flex gap-2">
            <button className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-foreground text-sm font-medium px-3 py-2 rounded-xl shadow-sm hover:bg-white transition-colors">
              <Share2 className="w-4 h-4" />
              {ar ? 'مشاركة' : 'Partager'}
            </button>
            {user && (
              <button
                onClick={() => toggleFavorite(property.id)}
                className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-foreground text-sm font-medium px-3 py-2 rounded-xl shadow-sm hover:bg-white transition-colors"
              >
                <Heart className={cn('w-4 h-4', property.is_favorited && 'fill-red-500 text-red-500')} />
                {ar ? 'حفظ' : 'Sauvegarder'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="page-container py-8">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Title & Basics */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{title}</h1>
                {/* Backend: rules.instant_booking (not booking_type === 'instant') */}
                {property.rules?.instant_booking && (
                  <div className="flex-shrink-0 flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Zap className="w-3.5 h-3.5" />
                    {ar ? 'حجز فوري' : 'Instant'}
                  </div>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-muted-foreground text-sm">
                {/* Backend: location.city */}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {property.location?.city}
                </span>
                {/* Backend: capacity.bedrooms / bathrooms / max_guests */}
                <span className="flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5" />
                  {property.capacity?.bedrooms} {ar ? 'غرف' : 'chambres'}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />
                  {property.capacity?.bathrooms} {ar ? 'حمامات' : 'SDB'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {property.capacity?.max_guests} {ar ? 'ضيوف' : 'personnes'}
                </span>
              </div>

              {/* Backend: stats.rating_average / stats.rating_count */}
              {(property.stats?.rating_count ?? 0) > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{property.stats.rating_average.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm">
                    ({property.stats.rating_count} {ar ? 'تقييم' : 'avis'})
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Host info */}
            {/* Backend: owner.name (full name), owner.is_verified_host, owner.host_since */}
            {property.owner && (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden flex-shrink-0">
                  {property.owner.avatar ? (
                    <Image src={property.owner.avatar} alt={property.owner.name} width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg">
                      {property.owner.name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {ar ? 'المضيف:' : 'Hôte :'}{' '}
                    {property.owner.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {property.owner.is_verified_host && (
                      <div className="flex items-center gap-1 text-primary text-xs">
                        <CheckCircle className="w-3 h-3" />
                        {ar ? 'مضيف موثّق' : 'Hôte vérifié'}
                      </div>
                    )}
                    {property.owner.host_since && (
                      <span className="text-muted-foreground text-xs">
                        {ar ? 'عضو منذ' : 'Membre depuis'}{' '}
                        {new Date(property.owner.host_since).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Description */}
            {desc && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {ar ? 'وصف العقار' : 'Description'}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {desc}
                </p>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Amenities — backend: a.name.ar / a.name.fr */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {ar ? 'المرافق والخدمات' : 'Équipements'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map(a => (
                    <div key={a.id} className="flex items-center gap-2.5 text-sm text-foreground">
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-base">{a.icon || '✓'}</span>
                      </div>
                      {ar ? a.name?.ar : (a.name?.fr || a.name?.ar)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* House rules — backend: rules is an object, rules.house_rules.{ar,fr} */}
            {property.rules?.house_rules && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {ar ? 'قواعد العقار' : 'Règles de la maison'}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                  {ar ? property.rules.house_rules.ar : (property.rules.house_rules.fr || property.rules.house_rules.ar)}
                </p>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Map — backend: location.lat / location.lng */}
            {property.location?.lat && property.location?.lng && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {ar ? 'الموقع' : 'Localisation'}
                </h2>
                <PropertyMap
                  lat={property.location.lat}
                  lng={property.location.lng}
                  title={title || ''}
                />
                <p className="text-muted-foreground text-sm mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.location.street
                    ? `${property.location.street}, ${property.location.city}`
                    : property.location.city}
                </p>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Reviews */}
            <ReviewsList
              propertyId={property.id}
              ratingAvg={property.stats?.rating_average ?? 0}
              ratingCount={property.stats?.rating_count ?? 0}
            />
          </div>

          {/* Right: Booking panel (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingPanel property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
