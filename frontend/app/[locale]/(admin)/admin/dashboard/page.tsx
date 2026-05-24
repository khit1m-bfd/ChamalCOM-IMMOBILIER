'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Users, Home, Calendar, DollarSign, TrendingUp, ArrowUpRight,
  Star, Shield, AlertCircle, CheckCircle, XCircle, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { api } from '@/lib/api/client'
import { formatPrice, cn } from '@/lib/utils'

interface AdminStats {
  total_users:       number
  total_properties:  number
  total_bookings:    number
  total_revenue:     number
  new_users_month:   number
  new_bookings_month: number
  revenue_month:     number
  pending_reviews:   number
  monthly_revenue:   { month: string; revenue: number; bookings: number }[]
  top_cities:        { city: string; count: number }[]
  booking_statuses:  { status: string; count: number }[]
}

const COLORS = ['#1a78e8', '#069880', '#d4901e', '#8b5cf6', '#ec4899']

export default function AdminDashboardPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [stats,   setStats]   = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setError(false)
        const [dash, analytics] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics'),
        ])
        const d = dash?.data ?? {}
        const a = analytics?.data ?? {}
        const bookingStatuses: { status: string; count: number }[] = Object.entries(
          (a?.bookings_by_status || {}) as Record<string, number>
        ).map(([status, count]) => ({ status, count }))

        setStats({
          total_users:        d?.stats?.users?.total          ?? 0,
          total_properties:   d?.stats?.properties?.total     ?? 0,
          total_bookings:     d?.stats?.bookings?.total       ?? 0,
          total_revenue:      d?.stats?.bookings?.revenue_year ?? 0,
          new_users_month:    d?.stats?.users?.this_month     ?? 0,
          new_bookings_month: d?.stats?.bookings?.this_month  ?? 0,
          revenue_month:      d?.stats?.bookings?.revenue_month ?? 0,
          pending_reviews:    d?.stats?.properties?.pending   ?? 0,
          monthly_revenue: (Array.isArray(d?.revenue_chart) ? d.revenue_chart : []).map((m: any) => ({
            month:    m?.label || m?.month || '',
            revenue:  m?.revenue  ?? 0,
            bookings: m?.bookings ?? 0,
          })),
          top_cities: (Array.isArray(a?.top_cities) ? a.top_cities : []).map((c: any) => ({
            city:  c?.address_city || c?.city || '',
            count: c?.count ?? 0,
          })),
          booking_statuses: bookingStatuses,
        })
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = stats ? [
    {
      icon: Users,     value: stats.total_users,      label: ar ? 'إجمالي المستخدمين' : 'Utilisateurs',
      sub:  `+${stats.new_users_month} ${ar ? 'هذا الشهر' : 'ce mois'}`,
      color: 'text-primary',    bg: 'bg-primary/10',
    },
    {
      icon: Home,      value: stats.total_properties, label: ar ? 'إجمالي العقارات' : 'Propriétés',
      sub: ar ? 'في الشبكة' : 'sur la plateforme',
      color: 'text-secondary',  bg: 'bg-secondary/10',
    },
    {
      icon: Calendar,  value: stats.total_bookings,   label: ar ? 'إجمالي الحجوزات' : 'Réservations',
      sub: `+${stats.new_bookings_month} ${ar ? 'هذا الشهر' : 'ce mois'}`,
      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: DollarSign,value: formatPrice(stats.total_revenue), label: ar ? 'إجمالي الإيرادات' : 'Chiffre d\'affaires',
      sub: `${formatPrice(stats.revenue_month)} ${ar ? 'هذا الشهر' : 'ce mois'}`,
      color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',
    },
  ] : []

  const bookingStatusLabels: Record<string, { ar: string; fr: string; color: string }> = {
    pending:   { ar: 'قيد الانتظار', fr: 'En attente', color: '#f97316' },
    confirmed: { ar: 'مؤكد',         fr: 'Confirmé',   color: '#22c55e' },
    completed: { ar: 'مكتمل',        fr: 'Terminé',    color: '#1a78e8' },
    cancelled: { ar: 'ملغى',         fr: 'Annulé',     color: '#ef4444' },
    rejected:  { ar: 'مرفوض',        fr: 'Refusé',     color: '#6b7280' },
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-xl w-64" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {ar ? 'لوحة الإدارة' : 'Tableau de bord'}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {ar ? 'نظرة شاملة على منصة شمال كوم' : 'Vue d\'ensemble de la plateforme ChamalCom'}
            </p>
          </div>
          {stats?.pending_reviews && stats.pending_reviews > 0 ? (
            <Link
              href={`/${locale}/admin/moderation`}
              className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-sm font-semibold px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-800"
            >
              <AlertCircle className="w-4 h-4" />
              {stats.pending_reviews} {ar ? 'عقارات تنتظر المراجعة' : 'en attente de modération'}
            </Link>
          ) : null}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, value, label, sub, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card rounded-2xl p-5 border border-border"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
            <p className="text-xs text-green-500 flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" />
              {sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {stats?.monthly_revenue && stats.monthly_revenue.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Revenue chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">
              {ar ? 'الإيرادات الشهرية (درهم)' : 'Revenus mensuels (MAD)'}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.monthly_revenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a78e8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a78e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [formatPrice(v), ar ? 'الإيرادات' : 'Revenus']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1a78e8" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Booking statuses pie */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">
              {ar ? 'حالات الحجوزات' : 'Statuts des réservations'}
            </h3>
            {stats.booking_statuses && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.booking_statuses.map(s => ({
                      name: bookingStatusLabels[s.status]?.[locale as 'ar' | 'fr'] || s.status,
                      value: s.count,
                    }))}
                    cx="50%" cy="45%"
                    innerRadius={50} outerRadius={75}
                    paddingAngle={3}
                  >
                    {stats.booking_statuses.map((s, i) => (
                      <Cell key={s.status} fill={bookingStatusLabels[s.status]?.color || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>
      )}

      {/* Top cities */}
      {stats?.top_cities && stats.top_cities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">
            {ar ? 'المدن الأكثر طلباً' : 'Villes les plus demandées'}
          </h3>
          <div className="space-y-3">
            {stats.top_cities.map(({ city, count }, i) => {
              const max  = stats.top_cities[0]?.count || 1
              const pct  = Math.round((count / max) * 100)
              return (
                <div key={city} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm font-medium text-foreground w-32 truncate">{city}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-brand rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-end">{count}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
