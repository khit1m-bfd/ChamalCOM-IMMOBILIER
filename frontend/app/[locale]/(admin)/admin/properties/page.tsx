'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Home, Star, Eye, CheckCircle, Clock, XCircle, Search, ToggleLeft, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatPrice, cn } from '@/lib/utils'

interface AdminProperty {
  id: string
  title: { ar: string; fr?: string }
  status: string
  is_featured: boolean
  cover_image?: string
  pricing: { per_night: number; currency: string }
  location: { city: string }
  stats: { rating_average: number; rating_count: number; bookings_count: number }
  owner?: { name: string }
}

const STATUS: Record<string, { label: { ar: string; fr: string }; color: string; icon: any }> = {
  published: { label: { ar: 'منشور', fr: 'Publié' },    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',  icon: CheckCircle },
  pending:   { label: { ar: 'معلق',  fr: 'En attente' }, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', icon: Clock },
  draft:     { label: { ar: 'مسودة', fr: 'Brouillon' },  color: 'text-muted-foreground bg-muted',                     icon: AlertCircle },
  suspended: { label: { ar: 'موقوف', fr: 'Suspendu' },   color: 'text-red-500 bg-red-50 dark:bg-red-900/20',          icon: XCircle },
}

export default function AdminPropertiesPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [properties,    setProperties]    = useState<AdminProperty[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(false)
  const [featureError,  setFeatureError]  = useState('')
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await api.get('/admin/properties', {
        params: { search: search || undefined, status: statusFilter || undefined, per_page: 30 }
      })
      setProperties(result.data || result.items || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, statusFilter])

  const handleToggleFeature = async (id: string) => {
    setFeatureError('')
    try {
      await api.patch(`/admin/properties/${id}/feature`)
      setProperties(ps => ps.map(p => p.id === id ? { ...p, is_featured: !p.is_featured } : p))
    } catch (e: any) {
      setFeatureError(e?.response?.data?.message || (ar ? 'فشلت العملية' : 'Opération échouée'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{ar ? 'إدارة العقارات' : 'Gestion des propriétés'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {properties.length} {ar ? 'عقار' : 'propriété(s)'}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/moderation`}
          className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-sm font-semibold px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors"
        >
          <Clock className="w-4 h-4" />
          {ar ? 'العقارات المعلقة' : 'En attente de modération'}
        </Link>
      </div>

      {featureError && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-2.5 border border-destructive/20">
          {featureError}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ar ? 'بحث عن عقار...' : 'Rechercher une propriété...'}
            className={cn('w-full h-10 bg-muted rounded-xl border border-border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30', ar ? 'pr-9 pl-3' : 'pl-9 pr-3')}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">{ar ? 'كل الحالات' : 'Tous les statuts'}</option>
          <option value="published">{ar ? 'منشور' : 'Publié'}</option>
          <option value="pending">{ar ? 'معلق' : 'En attente'}</option>
          <option value="suspended">{ar ? 'موقوف' : 'Suspendu'}</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground mb-3">{ar ? 'خطأ في التحميل' : 'Erreur de chargement'}</p>
          <button onClick={load} className="text-primary text-sm font-semibold hover:underline">{ar ? 'إعادة المحاولة' : 'Réessayer'}</button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <Home className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{ar ? 'لا توجد عقارات' : 'Aucune propriété'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property, i) => {
            const title = ar ? property.title?.ar : (property.title?.fr || property.title?.ar)
            const sc    = STATUS[property.status] || STATUS.draft
            const SI    = sc.icon
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl border border-border p-4 flex gap-3"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {property.cover_image
                    ? <Image src={property.cover_image} alt={title || ''} width={64} height={64} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">🏡</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm truncate">{title}</p>
                    <span className={cn('flex-shrink-0 flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full', sc.color)}>
                      <SI className="w-3 h-3" />
                      {sc.label[locale as 'ar' | 'fr']}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{property.location?.city} · {property.owner?.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-foreground">
                      {formatPrice(property.pricing?.per_night, property.pricing?.currency)}
                    </span>
                    {property.stats?.rating_count > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {property.stats.rating_average.toFixed(1)}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 ms-auto">
                      <Link href={`/${locale}/properties/${property.id}`} target="_blank" className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </Link>
                      <button
                        onClick={() => handleToggleFeature(property.id)}
                        className={cn('w-7 h-7 rounded-lg border flex items-center justify-center transition-colors',
                          property.is_featured ? 'bg-yellow-50 border-yellow-200 text-yellow-500' : 'border-border hover:bg-muted text-muted-foreground'
                        )}
                        title={property.is_featured ? (ar ? 'إلغاء التمييز' : 'Retirer mise en avant') : (ar ? 'تمييز' : 'Mettre en avant')}
                      >
                        <Star className={cn('w-3.5 h-3.5', property.is_featured && 'fill-yellow-400')} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
