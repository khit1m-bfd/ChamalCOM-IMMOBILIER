'use client'

import React, { useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { SlidersHorizontal, MapPin, SearchX } from 'lucide-react'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { PropertyCard } from '@/components/property/PropertyCard'
import { SearchBar } from '@/components/property/SearchBar'
import { CategoryFilter } from '@/components/property/CategoryFilter'
import { PropertyFilters } from '@/components/property/PropertyFilters'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function PropertiesPage() {
  const locale       = useLocale()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const ar           = locale === 'ar'

  const { properties, loading, searchProperties } = usePropertyStore()
  const [showFilters, setShowFilters] = useState(false)

  const buildParams = useCallback(() => {
    const p: Record<string, any> = {}
    searchParams.forEach((v, k) => { if (v) p[k] = v })
    return p
  }, [searchParams])

  useEffect(() => {
    searchProperties(buildParams())
  }, [searchParams, searchProperties, buildParams])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
  }

  const total    = properties?.meta?.total     || 0
  const lastPage = properties?.meta?.last_page || 1
  const currPage = properties?.meta?.current_page || 1
  const items    = properties?.data || []

  return (
    <>
      {/* Search bar sticky */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border py-3 shadow-sm">
        <div className="page-container">
          <SearchBar compact />
        </div>
      </div>

      {/* Category filter */}
      <CategoryFilter />

      <div className="page-container py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {!loading && (
              <p className="text-muted-foreground text-sm">
                {ar
                  ? `${total.toLocaleString('ar-MA')} عقار متاح`
                  : `${total.toLocaleString()} logement${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}`
                }
                {searchParams.get('city') && (
                  <span className="inline-flex items-center gap-1 ms-2 text-primary">
                    <MapPin className="w-3.5 h-3.5" />
                    {searchParams.get('city')}
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 h-9 px-4 rounded-xl border border-border text-sm font-medium transition-colors',
              showFilters ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-muted'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {ar ? 'تصفية' : 'Filtres'}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: ar ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-72 flex-shrink-0"
            >
              <PropertyFilters />
            </motion.aside>
          )}

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-3xl bg-muted animate-pulse aspect-[4/5]" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <SearchX className="w-16 h-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {ar ? 'لا توجد نتائج' : 'Aucun résultat'}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {ar
                    ? 'جرّب تغيير معايير البحث أو استكشف عقارات أخرى'
                    : 'Essayez de modifier vos critères ou explorez d\'autres propriétés'
                  }
                </p>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((property, i) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    >
                      <PropertyCard property={property} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          'w-10 h-10 rounded-xl text-sm font-medium transition-colors',
                          page === currPage
                            ? 'bg-primary text-white shadow-glow-blue'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
