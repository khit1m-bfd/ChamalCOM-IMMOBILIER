'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Trash2, Home } from 'lucide-react'
import { api } from '@/lib/api/client'
import { propertiesApi } from '@/lib/api/properties'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ar as arLocale, fr as frLocale } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface BlockedDate {
  id: string
  start_date: string
  end_date: string
  reason?: string
}

export default function OwnerCalendarPage() {
  const locale = useLocale()
  const isAr   = locale === 'ar'

  const { categories } = usePropertyStore()
  const [properties,      setProperties]      = useState<any[]>([])
  const [selectedProp,    setSelectedProp]    = useState<string>('')
  const [currentMonth,    setCurrentMonth]    = useState(new Date())
  const [blockedDates,    setBlockedDates]    = useState<BlockedDate[]>([])
  const [selectedDates,   setSelectedDates]   = useState<Date[]>([])
  const [reason,          setReason]          = useState('')
  const [loading,         setLoading]         = useState(false)
  const [saving,          setSaving]          = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/owner/properties', { params: { per_page: 50 } })
      const props = data.items || []
      setProperties(props)
      if (props.length > 0) setSelectedProp(props[0].id)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedProp) return
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await propertiesApi.availability(
          selectedProp,
          currentMonth.getMonth() + 1,
          currentMonth.getFullYear()
        )
        setBlockedDates(data.blocked_dates || data.blocks || [])
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedProp, currentMonth])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const firstDayOfWeek = startOfMonth(currentMonth).getDay()

  const isBlocked = (date: Date) =>
    blockedDates.some(b => {
      const start = new Date(b.start_date)
      const end   = new Date(b.end_date)
      return date >= start && date <= end
    })

  const isSelected = (date: Date) => selectedDates.some(d => isSameDay(d, date))

  const toggleDate = (date: Date) => {
    if (date < new Date()) return
    setSelectedDates(prev =>
      prev.some(d => isSameDay(d, date)) ? prev.filter(d => !isSameDay(d, date)) : [...prev, date]
    )
  }

  const handleBlock = async () => {
    if (!selectedDates.length || !selectedProp) return
    setSaving(true)
    try {
      const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
      await api.post(`/owner/properties/${selectedProp}/availability/block`, {
        start_date: format(sorted[0],  'yyyy-MM-dd'),
        end_date:   format(sorted[sorted.length - 1], 'yyyy-MM-dd'),
        reason,
      })
      setSelectedDates([])
      setReason('')
      // Refresh
      const { data } = await propertiesApi.availability(selectedProp, currentMonth.getMonth() + 1, currentMonth.getFullYear())
      setBlockedDates(data.data?.blocks || [])
    } catch { /* silent */ } finally {
      setSaving(false)
    }
  }

  const handleUnblock = async (blockId: string) => {
    try {
      await api.delete(`/owner/properties/${selectedProp}/availability/blocks/${blockId}`)
      setBlockedDates(bs => bs.filter(b => b.id !== blockId))
    } catch { /* silent */ }
  }

  const weekDays = isAr
    ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
    : ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: isAr ? arLocale : frLocale })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{isAr ? 'تقويم التوفر' : 'Calendrier de disponibilité'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{isAr ? 'أدر أيام الإغلاق والتوفر لعقاراتك' : 'Gérez les disponibilités de vos propriétés'}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Calendar */}
        <div className="lg:col-span-2 space-y-4">

          {/* Property selector */}
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select
              value={selectedProp}
              onChange={e => setSelectedProp(e.target.value)}
              className="flex-1 h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {isAr ? p.title?.ar : (p.title?.fr || p.title?.ar)}
                </option>
              ))}
            </select>
          </div>

          {/* Month navigation */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
              </button>
              <h2 className="font-semibold text-foreground capitalize">{monthLabel}</h2>
              <button
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronRight className={cn('w-4 h-4', isAr && 'rotate-180')} />
              </button>
            </div>

            {/* Week headers */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(day => {
                const blocked  = isBlocked(day)
                const selected = isSelected(day)
                const past     = day < new Date() && !isToday(day)
                const today    = isToday(day)

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => toggleDate(day)}
                    disabled={past}
                    className={cn(
                      'aspect-square rounded-xl text-sm font-medium transition-all',
                      past     && 'opacity-30 cursor-not-allowed',
                      today    && 'ring-2 ring-primary ring-offset-1',
                      blocked  && !selected && 'bg-red-100 dark:bg-red-900/30 text-red-600',
                      selected && 'bg-primary text-white shadow-glow-blue',
                      !blocked && !selected && !past && 'hover:bg-muted',
                    )}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />{isAr ? 'محجوز' : 'Bloqué'}</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary" />{isAr ? 'مختار' : 'Sélectionné'}</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded ring-2 ring-primary" />{isAr ? 'اليوم' : "Aujourd'hui"}</div>
            </div>
          </div>
        </div>

        {/* Sidebar: block form + existing blocks */}
        <div className="space-y-4">

          {/* Block action */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">
              {isAr ? 'إغلاق الأيام المختارة' : 'Bloquer les jours sélectionnés'}
            </h3>

            {selectedDates.length > 0 ? (
              <>
                <p className="text-muted-foreground text-xs">
                  {selectedDates.length} {isAr ? 'يوم مختار' : 'jour(s) sélectionné(s)'}
                </p>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {isAr ? 'سبب الإغلاق (اختياري)' : 'Motif (optionnel)'}
                  </label>
                  <input
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder={isAr ? 'صيانة، استخدام شخصي...' : 'Maintenance, usage personnel...'}
                    className="w-full h-9 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={handleBlock}
                  disabled={saving}
                  className="w-full h-9 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {saving ? '...' : (isAr ? 'تطبيق الإغلاق' : 'Bloquer')}
                </button>
              </>
            ) : (
              <p className="text-muted-foreground text-xs text-center py-2">
                {isAr ? 'انقر على الأيام في التقويم لاختيارها' : 'Cliquez sur des jours dans le calendrier'}
              </p>
            )}
          </div>

          {/* Existing blocks */}
          {blockedDates.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">
                {isAr ? 'الأيام المغلقة' : 'Jours bloqués'}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {blockedDates.map(block => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-red-700 dark:text-red-400">
                        {format(new Date(block.start_date), 'dd/MM')} → {format(new Date(block.end_date), 'dd/MM/yyyy')}
                      </p>
                      {block.reason && <p className="text-xs text-red-500 truncate">{block.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleUnblock(block.id)}
                      className="flex-shrink-0 w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
