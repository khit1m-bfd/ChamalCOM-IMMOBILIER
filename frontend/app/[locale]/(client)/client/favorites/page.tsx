'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { PropertyCard } from '@/components/property/PropertyCard'

export default function FavoritesPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { favorites, fetchFavorites, loading } = usePropertyStore()

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'العقارات المحفوظة' : 'Logements sauvegardés'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {favorites.length} {ar ? 'عقار محفوظ' : 'logement(s) sauvegardé(s)'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-72 bg-muted rounded-3xl animate-pulse" />)}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 bg-muted/40 rounded-2xl border border-dashed border-border text-center"
        >
          <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {ar ? 'لا توجد عقارات محفوظة' : 'Aucun logement sauvegardé'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-xs">
            {ar ? 'انقر على قلب أي عقار لحفظه هنا والرجوع إليه لاحقاً' : 'Cliquez sur le cœur d\'un logement pour le sauvegarder ici'}
          </p>
          <Link href={`/${locale}/properties`}
            className="inline-block bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
            {ar ? 'استكشف العقارات' : 'Explorer les logements'}
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((property, i) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
