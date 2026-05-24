'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { BarChart3, MapPin, TrendingUp, AlertCircle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { api } from '@/lib/api/client'
import { formatPrice, cn } from '@/lib/utils'

const COLORS = ['#1a78e8', '#069880', '#d4901e', '#8b5cf6', '#ec4899']

const STATUS_LABELS: Record<string, { ar: string; fr: string }> = {
  pending:   { ar: 'قيد الانتظار', fr: 'En attente' },
  confirmed: { ar: 'مؤكد',         fr: 'Confirmé' },
  completed: { ar: 'مكتمل',        fr: 'Terminé' },
  cancelled: { ar: 'ملغى',         fr: 'Annulé' },
  rejected:  { ar: 'مرفوض',        fr: 'Refusé' },
}

export default function AdminAnalyticsPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [period,  setPeriod]  = useState('30')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const result = await api.get('/admin/analytics', { params: { period } })
        setData(result.data ?? result)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  const bookingsByDay = data?.bookings_by_day || []
  const bookingsByStatus: { name: string; value: number }[] = Object.entries(
    (data?.bookings_by_status || {}) as Record<string, number>
  ).map(([status, count]) => ({
    name: STATUS_LABELS[status]?.[locale as 'ar' | 'fr'] || status,
    value: count,
  }))
  const topCities = data?.top_cities || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{ar ? 'الإحصائيات والتحليلات' : 'Analytiques'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {ar ? 'تحليل أداء المنصة والمقاييس الرئيسية' : 'Analyse des performances de la plateforme'}
          </p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="7">{ar ? 'آخر 7 أيام' : '7 derniers jours'}</option>
          <option value="30">{ar ? 'آخر 30 يوماً' : '30 derniers jours'}</option>
          <option value="90">{ar ? 'آخر 90 يوماً' : '90 derniers jours'}</option>
        </select>
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{ar ? 'خطأ في التحميل' : 'Erreur de chargement'}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Bookings by day chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl border border-border p-6 lg:col-span-2"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {ar ? 'الحجوزات والإيرادات اليومية' : 'Réservations et revenus quotidiens'}
            </h3>
            {bookingsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={bookingsByDay}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a78e8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a78e8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(v: number, name: string) =>
                      name === 'revenue' ? [formatPrice(v), ar ? 'إيراد' : 'Revenu'] : [v, ar ? 'حجوزات' : 'Rés.']
                    }
                  />
                  <Area yAxisId="left" type="monotone" dataKey="count" stroke="#069880" strokeWidth={2} fill="none" dot={false} />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#1a78e8" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                {ar ? 'لا توجد بيانات للفترة المحددة' : 'Aucune donnée pour cette période'}
              </div>
            )}
          </motion.div>

          {/* Status pie */}
          {bookingsByStatus.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">
                {ar ? 'توزيع حالات الحجوزات' : 'Répartition par statut'}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={bookingsByStatus} dataKey="value" cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {bookingsByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Top cities */}
          {topCities.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                {ar ? 'المدن الأكثر طلباً' : 'Villes les plus demandées'}
              </h3>
              <div className="space-y-3">
                {topCities.map(({ address_city, city, count }: any, i: number) => {
                  const cityName = address_city || city || '—'
                  const max = topCities[0]?.count || 1
                  const pct = Math.round((count / max) * 100)
                  return (
                    <div key={cityName} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground w-28 truncate">{cityName}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                          className="h-full bg-gradient-brand rounded-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-end">{count}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
