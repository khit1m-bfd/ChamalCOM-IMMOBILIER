'use client'

import React, { useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MapPin, Star, Shield, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
]

export function HeroSection() {
  const t      = useTranslations()
  const locale = useLocale()
  const ref    = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y     = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const stats = [
    { value: '500+', label: t('hero.stats.properties') },
    { value: '200+', label: t('hero.stats.hosts') },
    { value: '5K+',  label: t('hero.stats.guests') },
    { value: '10+',  label: t('hero.stats.cities') },
  ]

  const badges = [
    { icon: MapPin,  text: locale === 'ar' ? 'وادي لاو، المغرب' : 'Oued Laou, Maroc' },
    { icon: Star,    text: locale === 'ar' ? '4.9 تقييم متوسط'  : 'Note moyenne 4.9' },
    { icon: Shield,  text: locale === 'ar' ? 'حجز آمن 100%'     : 'Réservation 100% sécurisée' },
  ]

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] max-h-[960px] flex items-center overflow-hidden">

      {/* ── Background Image with Parallax ─────────────────── */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGES[0]})` }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </motion.div>

      {/* ── Moroccan Pattern Overlay ────────────────────────── */}
      <div className="absolute inset-0 moroccan-pattern opacity-30" />

      {/* ── Floating Particles ──────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{
              left:  `${15 + i * 15}%`,
              top:   `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y:       [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat:   Infinity,
              delay:    i * 0.8,
            }}
          />
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <motion.div className="relative z-10 page-container w-full" style={{ opacity }}>
        <div className="max-w-3xl py-8">

          {/* Location Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2 text-white/90 text-sm mb-6"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span>{locale === 'ar' ? 'وادي لاو · شمال المغرب' : 'Oued Laou · Nord du Maroc'}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            <span className="block">{t('hero.title')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Info Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {badges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 glass-dark rounded-full px-4 py-2 text-white/90 text-sm"
              >
                <badge.icon className="w-3.5 h-3.5 text-primary" />
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>

          {/* ── Stats Row ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
                className="glass-dark rounded-2xl px-4 py-3 flex flex-col items-center text-center border border-white/10"
              >
                <span className="text-2xl font-bold text-white leading-none">{stat.value}</span>
                <span className="text-white/60 text-xs mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href={`/${locale}/properties`}
              className="btn-primary text-base py-3 px-8 shadow-glow-blue"
            >
              {locale === 'ar' ? 'استكشف العقارات' : 'Explorer les logements'}
            </Link>
            <Link
              href={`/${locale}/auth/register?role=owner`}
              className="flex items-center gap-2 glass-dark text-white border border-white/20 rounded-2xl px-6 py-3 text-sm font-medium hover:bg-white/10 transition-all"
            >
              {locale === 'ar' ? 'أضف عقارك' : 'Proposer un logement'}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator ────────────────────────────────── */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-white/40 text-xs">{locale === 'ar' ? 'اسحب للأسفل' : 'Défiler'}</span>
        <ChevronDown className="w-5 h-5 text-white/40" />
      </motion.div>
    </section>
  )
}
