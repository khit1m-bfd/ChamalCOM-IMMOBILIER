'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { PlusCircle, Edit, Eye, Trash2, Star, BedDouble, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { propertiesApi } from '@/lib/api/properties'
import { type Property } from '@/lib/stores/propertyStore'
import { formatPrice, cn } from '@/lib/utils'

export default function OwnerPropertiesPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const [properties,   setProperties]   = useState<Property[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(false)
  const [deleting,     setDeleting]     = useState<string | null>(null)
  const [confirmDelete,setConfirmDelete]= useState<string | null>(null)
  const [deleteError,  setDeleteError]  = useState<string | null>(null)

  const loadProperties = async () => {
    setLoading(true)
    setError(false)
    try {
      // Backend: { success, data: { items: Property[], pagination: {...} } }
      const { data } = await propertiesApi.ownerProperties()
      setProperties(data.items || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProperties() }, [])

  const handleDelete = async (id: string) => {
    setConfirmDelete(null)
    setDeleting(id)
    setDeleteError(null)
    try {
      await propertiesApi.delete(id)
      setProperties(p => p.filter(x => x.id !== id))
    } catch (e: any) {
      setDeleteError(e?.response?.data?.message || (ar ? 'فشل الحذف، حاول مجدداً' : 'Échec de la suppression'))
    } finally {
      setDeleting(null)
    }
  }

  const STATUS_LABELS = {
    published:  { label: ar ? 'منشور'    : 'Publié',    color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    draft:      { label: ar ? 'مسودة'    : 'Brouillon', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    suspended:  { label: ar ? 'موقوف'    : 'Suspendu',  color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{ar ? 'عقاراتي' : 'Mes propriétés'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {properties.length} {ar ? 'عقار' : 'propriété(s)'}
          </p>
        </div>
        <Link
          href={`/${locale}/owner/properties/new`}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-glow-blue"
        >
          <PlusCircle className="w-4 h-4" />
          {ar ? 'إضافة عقار' : 'Ajouter'}
        </Link>
      </div>

      {deleteError && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-2.5 rounded-xl border border-destructive/20 flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ms-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground mb-3">{ar ? 'خطأ في تحميل العقارات' : 'Erreur de chargement'}</p>
          <button onClick={loadProperties} className="text-primary text-sm font-semibold hover:underline">
            {ar ? 'إعادة المحاولة' : 'Réessayer'}
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-dashed border-border">
          <div className="text-5xl mb-4">🏡</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {ar ? 'لا توجد عقارات بعد' : 'Aucune propriété'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {ar ? 'ابدأ بإضافة عقارك الأول الآن' : 'Commencez par ajouter votre première propriété'}
          </p>
          <Link
            href={`/${locale}/owner/properties/new`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {ar ? 'إضافة عقاري الأول' : 'Ajouter ma première propriété'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {properties.map((property, i) => {
            const img     = property.cover_image || property.images?.find(x => x.is_cover)?.url
            const title   = ar ? property.title?.ar : (property.title?.fr || property.title?.ar)
            const status  = STATUS_LABELS[property.status] || STATUS_LABELS.draft

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {img ? (
                      <Image src={img} alt={title || ''} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl">🏡</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{title}</h3>
                      <span className={cn('flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full', status.color)}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3" />
                        {property.capacity?.bedrooms} {ar ? 'غرف' : 'ch.'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {property.capacity?.max_guests}
                      </span>
                      {(property.stats?.rating_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {property.stats.rating_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {formatPrice(property.pricing?.per_night ?? 0, property.pricing?.currency ?? 'MAD')}
                        <span className="text-muted-foreground font-normal text-xs ms-1">/ {ar ? 'ليلة' : 'nuit'}</span>
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${locale}/properties/${property.id}`}
                          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          title={ar ? 'معاينة' : 'Aperçu'}
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                        <Link
                          href={`/${locale}/owner/properties/${property.id}/edit`}
                          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          title={ar ? 'تعديل' : 'Modifier'}
                        >
                          <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                        {confirmDelete === property.id ? (
                          <div className="flex items-center gap-1 bg-destructive/5 border border-destructive/20 rounded-xl px-2 py-1">
                            <span className="text-xs text-destructive font-medium">{ar ? 'حذف؟' : 'Suppr.?'}</span>
                            <button
                              onClick={() => handleDelete(property.id)}
                              disabled={deleting === property.id}
                              className="text-xs px-1.5 py-0.5 bg-destructive text-white rounded font-medium disabled:opacity-50"
                            >
                              {deleting === property.id ? '...' : (ar ? 'نعم' : 'Oui')}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs px-1.5 py-0.5 bg-muted rounded font-medium"
                            >
                              {ar ? 'لا' : 'Non'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(property.id)}
                            disabled={deleting === property.id}
                            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors disabled:opacity-50"
                            title={ar ? 'حذف' : 'Supprimer'}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
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
