'use client'

import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Calendar, Users, MapPin, ChevronDown, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar, fr } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

interface SearchBarProps {
  variant?: 'hero' | 'floating' | 'page'
  defaultValues?: {
    city?: string
    checkIn?: string
    checkOut?: string
    guests?: number
  }
}

type ActivePanel = 'location' | 'checkin' | 'checkout' | 'guests' | null

export function SearchBar({ variant = 'page', defaultValues }: SearchBarProps) {
  const t       = useTranslations()
  const locale  = useLocale()
  const router  = useRouter()
  const dateFns = locale === 'ar' ? ar : fr

  const [city,      setCity]     = useState(defaultValues?.city ?? '')
  const [checkIn,   setCheckIn]  = useState<Date | undefined>(defaultValues?.checkIn ? new Date(defaultValues.checkIn) : undefined)
  const [checkOut,  setCheckOut] = useState<Date | undefined>(defaultValues?.checkOut ? new Date(defaultValues.checkOut) : undefined)
  const [adults,    setAdults]   = useState(defaultValues?.guests ?? 2)
  const [children,  setChildren] = useState(0)
  const [active,    setActive]   = useState<ActivePanel>(null)

  const totalGuests = adults + children

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city)     params.set('city', city)
    if (checkIn)  params.set('check_in',  format(checkIn, 'yyyy-MM-dd'))
    if (checkOut) params.set('check_out', format(checkOut, 'yyyy-MM-dd'))
    if (totalGuests > 0) params.set('guests', String(totalGuests))
    router.push(`/${locale}/properties?${params.toString()}`)
    setActive(null)
  }

  const GuestCounter = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center font-semibold text-sm">{value}</span>
        <button
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )

  const containerCls = cn(
    'w-full',
    variant === 'floating' && 'glass shadow-glass-md rounded-3xl border border-white/30',
    variant === 'page'     && 'bg-card shadow-property rounded-3xl border border-border',
    variant === 'hero'     && 'glass shadow-glass-md rounded-3xl border border-white/30',
  )

  return (
    <div className={containerCls}>
      <div className="flex flex-col md:flex-row md:items-stretch">

        {/* ── Location ──────────────────────────────────────── */}
        <div
          className={cn(
            'relative flex-1 p-4 md:p-5 cursor-pointer rounded-3xl md:rounded-none md:rounded-s-3xl transition-colors',
            active === 'location' ? 'bg-white/10 md:bg-accent' : 'hover:bg-accent/50 md:hover:bg-accent/30'
          )}
          onClick={() => setActive(active === 'location' ? null : 'location')}
        >
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            {t('hero.searchPlaceholder')}
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onClick={(e) => { e.stopPropagation(); setActive('location') }}
              placeholder={t('hero.cityPlaceholder')}
              className="bg-transparent text-sm font-medium placeholder:text-muted-foreground focus:outline-none w-full"
            />
          </div>

          {active === 'location' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'absolute top-full mt-2 bg-popover border border-border rounded-2xl shadow-glass-md p-2 z-50 min-w-[240px]',
                locale === 'ar' ? 'right-0' : 'left-0'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {['وادي لاو', 'تطوان', 'مارتيل', 'الحسيمة', 'العرائش'].map((c) => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setActive(null) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl hover:bg-accent transition-colors text-start"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {c}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="hidden md:block w-px bg-border self-stretch" />

        {/* ── Check-in ──────────────────────────────────────── */}
        <div
          className={cn(
            'relative flex-1 p-4 md:p-5 cursor-pointer transition-colors',
            active === 'checkin' ? 'bg-accent' : 'hover:bg-accent/30'
          )}
          onClick={() => setActive(active === 'checkin' ? null : 'checkin')}
        >
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            <Calendar className="w-3 h-3 inline me-1" />
            {t('hero.checkIn')}
          </label>
          <p className={cn('text-sm font-medium', !checkIn && 'text-muted-foreground')}>
            {checkIn ? format(checkIn, 'dd MMM yyyy', { locale: dateFns }) : t('hero.checkIn')}
          </p>

          {active === 'checkin' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'absolute top-full mt-2 bg-popover border border-border rounded-2xl shadow-glass-md z-50',
                locale === 'ar' ? 'right-0' : 'left-0'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <DayPicker
                mode="single"
                selected={checkIn}
                onSelect={(d) => { setCheckIn(d); setActive('checkout') }}
                disabled={{ before: new Date() }}
                locale={dateFns}
                className="p-3"
              />
            </motion.div>
          )}
        </div>

        <div className="hidden md:block w-px bg-border self-stretch" />

        {/* ── Check-out ─────────────────────────────────────── */}
        <div
          className={cn(
            'relative flex-1 p-4 md:p-5 cursor-pointer transition-colors',
            active === 'checkout' ? 'bg-accent' : 'hover:bg-accent/30'
          )}
          onClick={() => setActive(active === 'checkout' ? null : 'checkout')}
        >
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            <Calendar className="w-3 h-3 inline me-1" />
            {t('hero.checkOut')}
          </label>
          <p className={cn('text-sm font-medium', !checkOut && 'text-muted-foreground')}>
            {checkOut ? format(checkOut, 'dd MMM yyyy', { locale: dateFns }) : t('hero.checkOut')}
          </p>

          {active === 'checkout' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'absolute top-full mt-2 bg-popover border border-border rounded-2xl shadow-glass-md z-50',
                locale === 'ar' ? 'right-0' : 'left-0'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <DayPicker
                mode="single"
                selected={checkOut}
                onSelect={(d) => { setCheckOut(d); setActive(null) }}
                disabled={{ before: checkIn || new Date() }}
                locale={dateFns}
                className="p-3"
              />
            </motion.div>
          )}
        </div>

        <div className="hidden md:block w-px bg-border self-stretch" />

        {/* ── Guests ────────────────────────────────────────── */}
        <div
          className={cn(
            'relative flex-1 p-4 md:p-5 cursor-pointer transition-colors',
            active === 'guests' ? 'bg-accent' : 'hover:bg-accent/30'
          )}
          onClick={() => setActive(active === 'guests' ? null : 'guests')}
        >
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            <Users className="w-3 h-3 inline me-1" />
            {t('common.guests')}
          </label>
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium">
              {totalGuests > 0
                ? `${totalGuests} ${t('common.guests')}`
                : t('hero.guestsPlaceholder')
              }
            </p>
            <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground ms-auto transition-transform', active === 'guests' && 'rotate-180')} />
          </div>

          {active === 'guests' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'absolute top-full mt-2 bg-popover border border-border rounded-2xl shadow-glass-md p-4 z-50 min-w-[260px]',
                locale === 'ar' ? 'right-0' : 'left-0'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <GuestCounter label={t('common.adults')}   value={adults}   onChange={setAdults}   min={1} />
              <GuestCounter label={t('common.children')} value={children} onChange={setChildren} />
            </motion.div>
          )}
        </div>

        {/* ── Search Button ─────────────────────────────────── */}
        <div className="p-3 flex items-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            className="w-full md:w-auto bg-gradient-brand text-white rounded-2xl px-6 py-3.5 md:py-4 font-semibold flex items-center justify-center gap-2 shadow-glow-blue hover:opacity-90 transition-opacity"
          >
            <Search className="w-4 h-4" />
            <span>{t('hero.searchButton')}</span>
          </motion.button>
        </div>
      </div>

      {/* Overlay to close panels */}
      {active && (
        <div className="fixed inset-0 z-40" onClick={() => setActive(null)} />
      )}
    </div>
  )
}
