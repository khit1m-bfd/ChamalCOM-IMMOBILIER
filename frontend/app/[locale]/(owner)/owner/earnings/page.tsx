'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { api } from '@/lib/api/client'
import { formatPrice, cn } from '@/lib/utils'

interface EarningsData {
  monthly: { month: string; earnings: number; bookings: number }[]
  total_year:    number
  total_month:   number
  avg_per_night: number
  growth_pct:    number
  pending_payout: number
  paid_out:      number
}

export default function OwnerEarningsPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const [data,    setData]    = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState<'6m' | '12m'>('6m')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: res } = await api.get('/owner/earnings', { params: { period } })
        setData(res)
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-72 bg-muted rounded-2xl" />
      </div>
    )
  }

  const growth = data?.growth_pct ?? 0

  const statCards = data ? [
    { icon: DollarSign,  label: ar ? 'أرباح هذا الشهر' : 'Ce mois',        value: formatPrice(data.total_month),   color: 'text-green-500',  bg: 'bg-green-50  dark:bg-green-900/20' },
    { icon: TrendingUp,  label: ar ? 'أرباح هذه السنة' : 'Cette année',     value: formatPrice(data.total_year),    color: 'text-primary',    bg: 'bg-primary/10' },
    { icon: Calendar,    label: ar ? 'متوسط سعر الليلة' : 'Prix/nuit moy.', value: formatPrice(data.avg_per_night), color: 'text-blue-500',   bg: 'bg-blue-50   dark:bg-blue-900/20' },
    { icon: DollarSign,  label: ar ? 'في انتظار الدفع'  : 'Paiement en att.',value: formatPrice(data.pending_payout),color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{ar ? 'الأرباح والإيرادات' : 'Revenus et gains'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {ar ? 'تتبع أرباحك الشهرية والسنوية' : 'Suivez vos revenus mensuels et annuels'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {(['6m', '12m'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground')}>
                {p === '6m' ? (ar ? '6 أشهر' : '6 mois') : (ar ? 'سنة' : '1 an')}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 h-9 px-4 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Download className="w-4 h-4" />
            {ar ? 'تصدير' : 'Exporter'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card rounded-2xl border border-border p-5"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Growth indicator */}
      {data && (
        <div className={cn('flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium w-fit',
          growth >= 0
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800'
        )}>
          {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {growth >= 0 ? '+' : ''}{growth}% {ar ? 'مقارنة بالشهر الماضي' : 'vs mois dernier'}
        </div>
      )}

      {/* Revenue chart */}
      {data?.monthly && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <h2 className="font-semibold text-foreground mb-4">{ar ? 'الإيرادات الشهرية' : 'Revenus mensuels'}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1a78e8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a78e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [formatPrice(v), ar ? 'الإيرادات' : 'Revenus']} />
              <Area type="monotone" dataKey="earnings" stroke="#1a78e8" fill="url(#earningsGrad)" strokeWidth={2} dot={{ fill: '#1a78e8', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Bookings chart */}
      {data?.monthly && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-5"
        >
          <h2 className="font-semibold text-foreground mb-4">{ar ? 'الحجوزات الشهرية' : 'Réservations mensuelles'}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [v, ar ? 'الحجوزات' : 'Réservations']} />
              <Bar dataKey="bookings" fill="#069880" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}
