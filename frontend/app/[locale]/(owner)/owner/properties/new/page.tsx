'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, ImagePlus, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { propertiesApi } from '@/lib/api/properties'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const schema = z.object({
  title_ar:             z.string().min(5).max(100),
  title_fr:             z.string().optional(),
  description_ar:       z.string().min(20).max(2000),
  description_fr:       z.string().optional(),
  category_id:          z.string().uuid(),
  city:                 z.string().min(2),
  address:              z.string().optional(),
  latitude:             z.number().optional(),
  longitude:            z.number().optional(),
  price_per_night:      z.number().positive(),
  cleaning_fee:         z.number().min(0).default(0),
  security_deposit:     z.number().min(0).default(0),
  max_guests:           z.number().int().positive().max(20),
  bedrooms:             z.number().int().min(0),
  bathrooms:            z.number().int().min(1),
  beds:                 z.number().int().positive(),
  min_nights:           z.number().int().positive().default(1),
  max_nights:           z.number().int().positive().optional(),
  booking_type:         z.enum(['instant', 'request']),
  cancellation_policy:  z.enum(['flexible', 'moderate', 'strict', 'super_strict']),
  rules:                z.string().optional(),
  amenities:            z.array(z.string()).optional(),
})

type PropertyForm = z.infer<typeof schema>

const MOROCCAN_CITIES = [
  'Oued Laou', 'Tétouan', 'Chefchaouen', 'Al Hoceima', 'Martil', 'Mdiq',
  'Cabo Negro', 'Fnideq', 'Larache', 'Asilah', 'Tanger',
]

const STEPS = [
  { id: 1, label: { ar: 'المعلومات الأساسية', fr: 'Informations de base' } },
  { id: 2, label: { ar: 'الموقع والسعر',     fr: 'Localisation & Prix' } },
  { id: 3, label: { ar: 'المرافق والقواعد',  fr: 'Équipements & Règles' } },
  { id: 4, label: { ar: 'الصور',             fr: 'Photos' } },
]

export default function NewPropertyPage() {
  const locale = useLocale()
  const router = useRouter()
  const ar     = locale === 'ar'

  const { categories, amenities, fetchCategories, fetchAmenities } = usePropertyStore()
  const [step,    setStep]    = useState(1)
  const [images,  setImages]  = useState<File[]>([])
  const [previews,setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => { fetchCategories(); fetchAmenities() }, [fetchCategories, fetchAmenities])

  const { register, control, handleSubmit, trigger, watch, formState: { errors } } = useForm<PropertyForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      booking_type:        'instant',
      cancellation_policy: 'flexible',
      min_nights:          1,
      cleaning_fee:        0,
      security_deposit:    0,
      amenities:           [],
    },
  })

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 20))
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls].slice(0, 20))
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setImages(prev => prev.filter((_, j) => j !== i))
    setPreviews(prev => prev.filter((_, j) => j !== i))
  }

  const goNext = async () => {
    const fieldsPerStep: Record<number, (keyof PropertyForm)[]> = {
      1: ['title_ar', 'category_id', 'max_guests', 'bedrooms', 'bathrooms', 'beds'],
      2: ['city', 'price_per_night'],
      3: [],
    }
    const valid = await trigger(fieldsPerStep[step] || [])
    if (valid) setStep(s => Math.min(4, s + 1))
  }

  const onSubmit = async (data: PropertyForm) => {
    if (images.length === 0) {
      setError(ar ? 'أضف صورة واحدة على الأقل' : 'Ajoutez au moins une photo')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: res } = await propertiesApi.create(data)
      const propertyId = res.data.id
      await propertiesApi.uploadImages(propertyId, images)
      router.push(`/${locale}/owner/properties`)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'حدث خطأ ما' : 'Une erreur est survenue'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError?: boolean) => cn(
    'w-full h-11 bg-muted rounded-xl border border-border text-sm px-3 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
    hasError && 'border-destructive'
  )

  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'إضافة عقار جديد' : 'Ajouter une propriété'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {ar ? 'أكمل الخطوات لنشر عقارك' : 'Complétez les étapes pour publier votre propriété'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                step > s.id  ? 'bg-primary border-primary text-white' :
                step === s.id? 'border-primary text-primary bg-primary/10' :
                               'border-border text-muted-foreground'
              )}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {s.label[locale as 'ar' | 'fr']}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-1 mb-4', step > s.id ? 'bg-primary' : 'bg-border')} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className={labelClass}>{ar ? 'عنوان العقار (عربي)' : 'Titre en arabe'} *</label>
                <input {...register('title_ar')} className={inputClass(!!errors.title_ar)} placeholder={ar ? 'مثال: فيلا مطلة على البحر في وادي لاو' : 'Ex: Villa vue mer à Oued Laou'} />
                {errors.title_ar && <p className="text-destructive text-xs mt-1">{ar ? '5 أحرف على الأقل' : '5 caractères minimum'}</p>}
              </div>
              <div>
                <label className={labelClass}>{ar ? 'عنوان العقار (فرنسي - اختياري)' : 'Titre en français (optionnel)'}</label>
                <input {...register('title_fr')} className={inputClass()} placeholder="Villa vue mer à Oued Laou" />
              </div>
              <div>
                <label className={labelClass}>{ar ? 'التصنيف' : 'Catégorie'} *</label>
                <select {...register('category_id')} className={inputClass(!!errors.category_id)}>
                  <option value="">{ar ? '-- اختر التصنيف --' : '-- Choisir --'}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{ar ? c.name?.ar : (c.name?.fr || c.name?.ar)}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-destructive text-xs mt-1">{ar ? 'مطلوب' : 'Requis'}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: 'bedrooms' as const, label: ar ? 'عدد الغرف' : 'Chambres' },
                  { field: 'bathrooms' as const, label: ar ? 'الحمامات' : 'SDB' },
                  { field: 'beds' as const, label: ar ? 'الأسرة' : 'Lits' },
                  { field: 'max_guests' as const, label: ar ? 'أقصى عدد ضيوف' : 'Capacité max.' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className={labelClass}>{label} *</label>
                    <input type="number" min={field === 'bathrooms' ? 1 : 0} {...register(field, { valueAsNumber: true })} className={inputClass(!!errors[field])} />
                  </div>
                ))}
              </div>
              <div>
                <label className={labelClass}>{ar ? 'وصف العقار (عربي)' : 'Description en arabe'} *</label>
                <textarea {...register('description_ar')} rows={4} className={cn(inputClass(!!errors.description_ar), 'h-auto resize-none pt-2.5')} placeholder={ar ? 'صف عقارك بتفصيل...' : 'Décrivez votre bien en arabe...'} />
                {errors.description_ar && <p className="text-destructive text-xs mt-1">{ar ? '20 حرف على الأقل' : '20 caractères minimum'}</p>}
              </div>
              <div>
                <label className={labelClass}>{ar ? 'وصف بالفرنسية (اختياري)' : 'Description française (optionnel)'}</label>
                <textarea {...register('description_fr')} rows={3} className={cn(inputClass(), 'h-auto resize-none pt-2.5')} />
              </div>
            </motion.div>
          )}

          {/* Step 2: Location & Price */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className={labelClass}>{ar ? 'المدينة' : 'Ville'} *</label>
                <select {...register('city')} className={inputClass(!!errors.city)}>
                  <option value="">{ar ? '-- اختر المدينة --' : '-- Choisir la ville --'}</option>
                  {MOROCCAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{ar ? 'العنوان التفصيلي' : 'Adresse détaillée'}</label>
                <input {...register('address')} className={inputClass()} placeholder={ar ? 'رقم، شارع، حي...' : 'N°, rue, quartier...'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{ar ? 'خط العرض' : 'Latitude'}</label>
                  <input type="number" step="any" {...register('latitude', { valueAsNumber: true })} className={inputClass()} placeholder="35.1234" />
                </div>
                <div>
                  <label className={labelClass}>{ar ? 'خط الطول' : 'Longitude'}</label>
                  <input type="number" step="any" {...register('longitude', { valueAsNumber: true })} className={inputClass()} placeholder="-5.1234" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{ar ? 'السعر / ليلة (درهم)' : 'Prix / nuit (MAD)'} *</label>
                  <input type="number" min={0} {...register('price_per_night', { valueAsNumber: true })} className={inputClass(!!errors.price_per_night)} placeholder="500" />
                </div>
                <div>
                  <label className={labelClass}>{ar ? 'رسوم التنظيف' : 'Frais de ménage'}</label>
                  <input type="number" min={0} {...register('cleaning_fee', { valueAsNumber: true })} className={inputClass()} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>{ar ? 'الوديعة التأمينية' : 'Caution'}</label>
                  <input type="number" min={0} {...register('security_deposit', { valueAsNumber: true })} className={inputClass()} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>{ar ? 'الحد الأدنى للليالي' : 'Durée min. (nuits)'}</label>
                  <input type="number" min={1} {...register('min_nights', { valueAsNumber: true })} className={inputClass()} placeholder="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{ar ? 'نوع الحجز' : 'Type de réservation'}</label>
                  <select {...register('booking_type')} className={inputClass()}>
                    <option value="instant">{ar ? 'فوري' : 'Instantané'}</option>
                    <option value="request">{ar ? 'بطلب' : 'Sur demande'}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{ar ? 'سياسة الإلغاء' : 'Politique d\'annulation'}</label>
                  <select {...register('cancellation_policy')} className={inputClass()}>
                    <option value="flexible">{ar ? 'مرنة' : 'Flexible'}</option>
                    <option value="moderate">{ar ? 'معتدلة' : 'Modérée'}</option>
                    <option value="strict">{ar ? 'صارمة' : 'Stricte'}</option>
                    <option value="super_strict">{ar ? 'صارمة جداً' : 'Super stricte'}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Amenities & Rules */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label className={labelClass}>{ar ? 'المرافق المتاحة' : 'Équipements'}</label>
                <Controller
                  control={control}
                  name="amenities"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {amenities.map(a => {
                        const checked = field.value?.includes(a.id)
                        return (
                          <label key={a.id} className={cn(
                            'flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all',
                            checked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                          )}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                const cur = field.value || []
                                field.onChange(e.target.checked ? [...cur, a.id] : cur.filter(id => id !== a.id))
                              }}
                              className="sr-only"
                            />
                            <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors', checked ? 'bg-primary border-primary' : 'border-border')}>
                              {checked && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-sm text-foreground">{ar ? a.name?.ar : (a.name?.fr || a.name?.ar)}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
              </div>
              <div>
                <label className={labelClass}>{ar ? 'قواعد العقار' : 'Règles de la maison'}</label>
                <textarea {...register('rules')} rows={5} className={cn(inputClass(), 'h-auto resize-none pt-2.5')}
                  placeholder={ar
                    ? 'مثال: ممنوع التدخين - الحيوانات الأليفة مسموح بها...'
                    : 'Ex: Non-fumeur - Animaux acceptés...'
                  }
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Images */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className={labelClass}>{ar ? 'صور العقار' : 'Photos de la propriété'} *</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <ImagePlus className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
                  <p className="font-medium text-foreground text-sm">{ar ? 'انقر لرفع الصور' : 'Cliquez pour télécharger'}</p>
                  <p className="text-muted-foreground text-xs mt-1">{ar ? 'PNG, JPG, WebP - 20 صورة كحد أقصى' : 'PNG, JPG, WebP - 20 photos max'}</p>
                  <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="sr-only" />
                </label>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                      <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                      {i === 0 && (
                        <div className="absolute top-1.5 start-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          {ar ? 'رئيسية' : 'Principale'}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 end-1.5 w-6 h-6 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2 border border-destructive/20">
                  {error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 h-12 px-6 border-2 border-border rounded-2xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className={cn('w-4 h-4', ar && 'rotate-180')} />
              {ar ? 'السابق' : 'Précédent'}
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-white rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-glow-blue"
            >
              {ar ? 'التالي' : 'Suivant'}
              <ChevronRight className={cn('w-4 h-4', ar && 'rotate-180')} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-gradient-brand text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? (ar ? 'جارٍ النشر...' : 'Publication...')
                : (ar ? 'نشر العقار' : 'Publier la propriété')
              }
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
