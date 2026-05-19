'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import {
  TrendingUp, Star, Eye, Calendar, Users, Home,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { api } from '@/lib/api/client'
import { formatPrice, cn } from '@/lib/utils'

interface AnalyticsData {
  overview: {
    total_views: number
    total_bookings: number
    total_reviews: number
    avg_rating: number
    conversion_rate: number
    repeat_guests: number
  }
  monthly_views:    { month: string; views: number; bookings: number }[]
  top_properties:   { id: string; title: string; views: number; bookings: number; revenue: number; rating: number }[]
  booking_sources:  { source: string; count: number; pct: number }[]
  rating_breakdown: { stars: number; count: number; pct: number }[]
}

const COLORS = ['#1a78e8', '#069880', '#f59e0b', '#ef4444', '#8b5cf6']

export default function OwnerAnalyticsPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [data,    setData]    = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState<'30d' | '90d' | '12m'>('30d')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: res } = await api.get('/owner/analytics', { params: { period } })
        setData(res)
      } catch {
        // Build mock data so the page renders even without the endpoint
        setData({
          overview: { total_views: 0, total_bookings: 0, total_reviews: 0, avg_rating: 0, conversion_rate: 0, repeat_guests: 0 },
          monthly_views: [],
          top_properties: [],
          booking_sources: [],
          rating_breakdown: [5,4,3,2,1].map(s => ({ stars: s, count: 0, pct: 0 })),
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  const overviewCards = data ? [
    { icon: Eye,      label: ar ? 'إجمالي المشاهدات'  : 'Vues totales',     value: data.overview.total_views.toLocaleString(),  trend: null,  color: 'text-blue-500',   bg: 'bg-blue-50   dark:bg-blue-900/20' },
    { icon: Calendar, label: ar ? 'إجمالي الحجوزات'   : 'Réservations',     value: data.overview.total_bookings.toString(),     trend: null,  color: 'text-green-500',  bg: 'bg-green-50  dark:bg-green-900/20' },
    { icon: Star,     label: ar ? 'متوسط التقييم'     : 'Note moyenne',     value: `${data.overview.avg_rating.toFixed(1)}/5`,  trend: null,  color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { icon: TrendingUp, label: ar ? 'معدل التحويل'    : 'Taux conversion',  value: `${data.overview.conversion_rate}%`,        trend: null,  color: 'text-primary',    bg: 'bg-primary/10' },
    { icon: Users,    label: ar ? 'ضيوف متكررون'      : 'Clients fidèles',  value: data.overview.repeat_guests.toString(),     trend: null,  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: Home,     label: ar ? 'إجمالي التقييمات'  : 'Avis reçus',       value: data.overview.total_reviews.toString(),     trend: null,  color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ] : []

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="h-72 bg-muted rounded-2xl" />
          <div className="h-72 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{ar ? 'تحليلات الأداء' : 'Analytiques'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {ar ? 'تتبع أداء عقاراتك بالتفصيل' : 'Suivez la performance de vos propriétés'}
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {(['30d', '90d', '12m'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}>
              {p === '30d' ? (ar ? '30 يوم' : '30j') : p === '90d' ? (ar ? '90 يوم' : '90j') : (ar ? '12 شهر' : '12m')}
            </button>
          ))}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewCards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
            className="bg-card rounded-2xl border border-border p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Views & bookings over time */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">{ar ? 'المشاهدات والحجوزات' : 'Vues & réservations'}</h2>
          {(data?.monthly_views?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data!.monthly_views} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a78e8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1a78e8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#069880" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#069880" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="views"    stroke="#1a78e8" fill="url(#viewsGrad)"    strokeWidth={2} name={ar ? 'مشاهدات' : 'Vues'} />
                <Area type="monotone" dataKey="bookings" stroke="#069880" fill="url(#bookingsGrad)" strokeWidth={2} name={ar ? 'حجوزات' : 'Réservations'} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
              {ar ? 'لا توجد بيانات بعد' : 'Aucune donnée disponible'}
            </div>
          )}
        </motion.div>

        {/* Rating breakdown */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">{ar ? 'توزيع التقييمات' : 'Distribution des notes'}</h2>
          <div className="space-y-3">
            {(data?.rating_breakdown ?? []).map(({ stars, count, pct }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 w-20 flex-shrink-0">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-end">{count} ({pct}%)</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top properties table */}
      {(data?.top_properties?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">{ar ? 'أداء العقارات' : 'Performance des propriétés'}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="p-4 text-start font-medium">{ar ? 'العقار' : 'Propriété'}</th>
                  <th className="p-4 text-start font-medium hidden md:table-cell">{ar ? 'المشاهدات' : 'Vues'}</th>
                  <th className="p-4 text-start font-medium">{ar ? 'الحجوزات' : 'Réservations'}</th>
                  <th className="p-4 text-start font-medium hidden lg:table-cell">{ar ? 'الإيرادات' : 'Revenus'}</th>
                  <th className="p-4 text-start font-medium">{ar ? 'التقييم' : 'Note'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data!.top_properties.map(prop => (
                  <tr key={prop.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-4">
                      <Link href={`/${locale}/properties/${prop.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-[180px] block">
                        {prop.title}
                      </Link>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{prop.views.toLocaleString()}</td>
                    <td className="p-4 text-foreground font-medium">{prop.bookings}</td>
                    <td className="p-4 hidden lg:table-cell font-semibold text-foreground">{formatPrice(prop.revenue)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{prop.rating.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Booking sources pie */}
      {(data?.booking_sources?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-5">{ar ? 'مصادر الحجوزات' : 'Sources des réservations'}</h2>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={data!.booking_sources} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                  {data!.booking_sources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {data!.booking_sources.map((s, i) => (
                <div key={s.source} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-foreground capitalize">{s.source}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
