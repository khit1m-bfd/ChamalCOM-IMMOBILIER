'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Save, Trash2, Upload, X, ArrowLeft, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api/client'
import { propertiesApi } from '@/lib/api/properties'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  title_ar:            z.string().min(5),
  title_fr:            z.string().optional(),
  description_ar:      z.string().min(20).optional(),
  description_fr:      z.string().optional(),
  city:                z.string().min(2),
  address:             z.string().optional(),
  price_per_night:     z.number().min(50),
  cleaning_fee:        z.number().min(0).default(0),
  security_deposit:    z.number().min(0).default(0),
  max_guests:          z.number().min(1),
  bedrooms:            z.number().min(0),
  bathrooms:           z.number().min(1),
  beds:                z.number().min(1),
  min_nights:          z.number().min(1),
  booking_type:        z.enum(['instant', 'request']),
  cancellation_policy: z.enum(['flexible', 'moderate', 'strict', 'super_strict']),
  status:              z.enum(['draft', 'published']),
  rules:               z.string().optional(),
  amenities:           z.array(z.string()).default([]),
})
type PropertyForm = z.infer<typeof schema>

export default function EditPropertyPage() {
  const { id }   = useParams<{ id: string }>()
  const locale   = useLocale()
  const router   = useRouter()
  const ar       = locale === 'ar'

  const { amenities, fetchAmenities } = usePropertyStore()
  const [property, setProperty]       = useState<any>(null)
  const [loading,  setLoading]        = useState(true)
  const [saving,   setSaving]         = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [success,  setSuccess]        = useState(false)
  const [error,    setError]          = useState('')

  useEffect(() => { fetchAmenities() }, [fetchAmenities])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/owner/properties/${id}`)
        setProperty(data)
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PropertyForm>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (property) {
      const houseRules = property.rules?.house_rules
      reset({
        title_ar:            property.title?.ar            ?? '',
        title_fr:            property.title?.fr            ?? '',
        description_ar:      property.description?.ar      ?? '',
        description_fr:      property.description?.fr      ?? '',
        city:                property.location?.city       ?? '',
        address:             property.location?.street     ?? '',
        price_per_night:     property.pricing?.per_night   ?? 0,
        cleaning_fee:        property.pricing?.cleaning_fee    ?? 0,
        security_deposit:    property.pricing?.security_deposit ?? 0,
        max_guests:          property.capacity?.max_guests  ?? 1,
        bedrooms:            property.capacity?.bedrooms    ?? 0,
        bathrooms:           property.capacity?.bathrooms   ?? 1,
        beds:                property.capacity?.beds        ?? 1,
        min_nights:          property.rules?.min_nights     ?? 1,
        booking_type:        property.rules?.instant_booking ? 'instant' : 'request',
        cancellation_policy: property.rules?.cancellation_policy ?? 'flexible',
        status:              property.status               ?? 'draft',
        rules:               typeof houseRules === 'string'
                               ? houseRules
                               : (houseRules?.ar ?? ''),
        amenities:           property.amenities?.map((a: any) => a.id) ?? [],
      })
    }
  }, [property, reset])

  const onSubmit = async (values: PropertyForm) => {
    setSaving(true)
    setError('')
    try {
      await api.put(`/properties/${id}`, values)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'فشل الحفظ' : 'Échec de la sauvegarde'))
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      await propertiesApi.uploadImages(id, files)
      const { data } = await api.get(`/owner/properties/${id}`)
      setProperty(data)
    } catch { /* silent */ } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      await propertiesApi.deleteImage(id, imageId)
      setProperty((p: any) => ({ ...p, images: p.images.filter((img: any) => img.id !== imageId) }))
    } catch { /* silent */ }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      await api.patch(`/properties/${id}/images/${imageId}/primary`)
      setProperty((p: any) => ({
        ...p,
        images: p.images.map((img: any) => ({ ...img, is_cover: img.id === imageId })),
      }))
    } catch { /* silent */ }
  }

  const handleDelete = async () => {
    if (!confirm(ar ? 'هل أنت متأكد من حذف هذا العقار نهائياً؟' : 'Êtes-vous sûr de supprimer définitivement cette propriété ?')) return
    setDeleting(true)
    try {
      await api.delete(`/properties/${id}`)
      router.push(`/${locale}/owner/properties`)
    } catch { /* silent */ } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded-xl w-64" />
      <div className="h-96 bg-muted rounded-2xl" />
    </div>
  )

  if (!property) return (
    <div className="text-center py-20 text-muted-foreground">{ar ? 'العقار غير موجود' : 'Propriété introuvable'}</div>
  )

  const field = (name: keyof PropertyForm, label: string, type: 'text' | 'number' | 'textarea' = 'text') => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          {...register(name as any)}
          className={cn('w-full bg-muted rounded-xl border border-border text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none', errors[name] && 'border-destructive')}
        />
      ) : (
        <input
          type={type}
          step={type === 'number' ? '0.01' : undefined}
          {...register(name as any, type === 'number' ? { valueAsNumber: true } : {})}
          className={cn('w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30', errors[name] && 'border-destructive')}
        />
      )}
      {errors[name] && <p className="text-destructive text-xs mt-1">{ar ? 'مطلوب' : 'Requis'}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <ArrowLeft className={cn('w-4 h-4', ar && 'rotate-180')} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{ar ? 'تعديل العقار' : 'Modifier la propriété'}</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{ar ? property.title?.ar : (property.title?.fr || property.title?.ar)}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 h-9 px-4 border border-destructive/30 text-destructive text-sm font-medium rounded-xl hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {ar ? 'حذف' : 'Supprimer'}
        </button>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 text-sm rounded-2xl px-4 py-3 border border-green-200">
          {ar ? 'تم حفظ التغييرات بنجاح' : 'Modifications enregistrées avec succès'}
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 border border-destructive/20">{error}</div>
      )}

      {/* Images */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{ar ? 'صور العقار' : 'Photos'}</h2>
          <label className="flex items-center gap-1.5 cursor-pointer h-9 px-4 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
            <ImagePlus className="w-4 h-4" />
            {uploading ? '...' : (ar ? 'إضافة صور' : 'Ajouter')}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {(property.images || []).map((img: any) => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
              <Image src={img.url} alt="property" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!img.is_cover && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className="text-[10px] bg-white/90 text-foreground font-medium px-2 py-1 rounded-lg hover:bg-white"
                  >
                    {ar ? 'رئيسية' : 'Princ.'}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="w-7 h-7 bg-destructive/90 text-white rounded-lg flex items-center justify-center hover:bg-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {img.is_cover && (
                <div className="absolute top-1 start-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  {ar ? 'رئيسية' : 'Princ.'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">{ar ? 'المعلومات الأساسية' : 'Informations de base'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {field('title_ar', ar ? 'العنوان (عربي)' : 'Titre (Arabe)')}
            {field('title_fr', ar ? 'العنوان (فرنسي)' : 'Titre (Français)')}
          </div>
          {field('description_ar', ar ? 'الوصف (عربي)' : 'Description (Arabe)', 'textarea')}
          {field('description_fr', ar ? 'الوصف (فرنسي)' : 'Description (Français)', 'textarea')}
          <div className="grid md:grid-cols-2 gap-4">
            {field('city', ar ? 'المدينة' : 'Ville')}
            {field('address', ar ? 'العنوان التفصيلي' : 'Adresse')}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">{ar ? 'الأسعار' : 'Tarification'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {field('price_per_night',  ar ? 'السعر/ليلة (MAD)' : 'Prix/nuit (MAD)', 'number')}
            {field('cleaning_fee',     ar ? 'رسوم تنظيف' : 'Ménage', 'number')}
            {field('security_deposit', ar ? 'تأمين' : 'Dépôt', 'number')}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">{ar ? 'المواصفات' : 'Caractéristiques'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {field('max_guests', ar ? 'الضيوف' : 'Voyageurs', 'number')}
            {field('bedrooms',   ar ? 'الغرف' : 'Chambres', 'number')}
            {field('bathrooms',  ar ? 'الحمامات' : 'SDB', 'number')}
            {field('beds',       ar ? 'الأسرة' : 'Lits', 'number')}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{ar ? 'نوع الحجز' : 'Type de réservation'}</label>
              <select {...register('booking_type')}
                className="w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="instant">{ar ? 'فوري' : 'Instantané'}</option>
                <option value="request">{ar ? 'بطلب' : 'Sur demande'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{ar ? 'سياسة الإلغاء' : 'Annulation'}</label>
              <select {...register('cancellation_policy')}
                className="w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="flexible">{ar ? 'مرن' : 'Flexible'}</option>
                <option value="moderate">{ar ? 'معتدل' : 'Modéré'}</option>
                <option value="strict">{ar ? 'صارم' : 'Strict'}</option>
                <option value="super_strict">{ar ? 'صارم جداً' : 'Très strict'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{ar ? 'الحالة' : 'Statut'}</label>
              <select {...register('status')}
                className="w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="published">{ar ? 'منشور' : 'Publié'}</option>
                <option value="draft">{ar ? 'مسودة' : 'Brouillon'}</option>
              </select>
            </div>
          </div>
          {field('min_nights', ar ? 'الحد الأدنى للليالي' : 'Nuits min.', 'number')}
          {field('rules', ar ? 'قواعد المنزل' : 'Règles de la maison', 'textarea')}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h2 className="font-semibold text-foreground">{ar ? 'المرافق والخدمات' : 'Équipements'}</h2>
            <Controller
              control={control}
              name="amenities"
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {amenities.map(a => {
                    const checked = field.value?.includes(a.id)
                    return (
                      <label key={a.id}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm',
                          checked ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
                        )}>
                        <input type="checkbox" checked={checked} onChange={e => {
                          const cur = field.value || []
                          field.onChange(e.target.checked ? [...cur, a.id] : cur.filter((x: string) => x !== a.id))
                        }} className="sr-only" />
                        <span className="text-base">{a.icon || '✓'}</span>
                        <span className="truncate">{ar ? a.name?.ar : (a.name?.fr || a.name?.ar)}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()}
            className="h-11 px-6 border border-border rounded-2xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            {ar ? 'إلغاء' : 'Annuler'}
          </button>
          <button type="submit" disabled={saving}
            className="h-11 px-8 bg-gradient-brand text-white rounded-2xl text-sm font-semibold shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? (ar ? 'جارٍ الحفظ...' : 'Enregistrement...') : (ar ? 'حفظ التغييرات' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  )
}
