'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CategoryFilter() {
  const locale = useLocale()
  const { categories, fetchCategories } = usePropertyStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 240
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  const iconMap: Record<string, string> = {
    'villa': '🏡', 'appartement': '🏢', 'studio': '🛏️',
    'dar': '🏠', 'maison-rurale': '🌿', 'chambre': '🛏️',
    'chalet': '⛰️', 'plage': '🏖️',
  }

  return (
    <section className="py-10 border-b border-border flex items-center">
      <div className="page-container w-full">
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background shadow-md rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              {locale === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex justify-center gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12 py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* All */}
            <Link href={`/${locale}/properties`} className="flex-shrink-0 flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-2xl shadow-md group-hover:shadow-glow-blue transition-all">
                🏠
              </div>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {locale === 'ar' ? 'الكل' : 'Tout'}
              </span>
            </Link>

            {(categories || []).map((cat: any, i: number) => (
              <motion.div
                key={cat.id}
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/${locale}/properties?category_id=${cat.id}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-200 shadow-sm">
                    {iconMap[cat.slug] || '🏡'}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap transition-colors">
                    {locale === 'ar' ? (cat.name?.ar ?? cat.name_ar) : (cat.name?.fr ?? cat.name_fr ?? cat.name?.ar ?? cat.name_ar)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background shadow-md rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              {locale === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
