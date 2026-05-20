'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useForm, Controller } from 'react-hook-form'
import { usePropertyStore } from '@/lib/stores/propertyStore'
import { cn } from '@/lib/utils'

interface FilterForm {
  min_price?:  number
  max_price?:  number
  bedrooms?:   number
  bathrooms?:  number
  amenities?:  string[]
  sort?:       string
}

export function PropertyFilters() {
  const locale       = useLocale()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { amenities, fetchAmenities } = usePropertyStore()
  const ar = locale === 'ar'

  React.useEffect(() => { fetchAmenities() }, [fetchAmenities])

  const { register, control, handleSubmit, reset } = useForm<FilterForm>({
    defaultValues: {
      min_price:  searchParams.get('min_price')  ? Number(searchParams.get('min_price'))  : undefined,
      max_price:  searchParams.get('max_price')  ? Number(searchParams.get('max_price'))  : undefined,
      bedrooms:   searchParams.get('bedrooms')   ? Number(searchParams.get('bedrooms'))   : undefined,
      bathrooms:  searchParams.get('bathrooms')  ? Number(searchParams.get('bathrooms'))  : undefined,
      amenities:  searchParams.getAll('amenities[]'),
      sort:       searchParams.get('sort') || '',
    },
  })

  const onSubmit = (values: FilterForm) => {
    const params = new URLSearchParams(searchParams.toString())
    const set = (k: string, v: any) => v ? params.set(k, String(v)) : params.delete(k)
    set('min_price', values.min_price)
    set('max_price', values.max_price)
    set('bedrooms',  values.bedrooms)
    set('bathrooms', values.bathrooms)
    set('sort',      values.sort)
    params.delete('amenities[]')
    values.amenities?.forEach(a => params.append('amenities[]', a))
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const handleReset = () => {
    reset({ min_price: undefined, max_price: undefined, bedrooms: undefined, bathrooms: undefined, amenities: [], sort: '' })
    const params = new URLSearchParams()
    const keep = ['city', 'check_in', 'check_out', 'guests']
    keep.forEach(k => { const v = searchParams.get(k); if (v) params.set(k, v) })
    router.push(`?${params.toString()}`)
  }

  const sortOptions = ar
    ? [
        { value: '',           label: 'الأكثر صلة' },
        { value: 'price_asc',  label: 'السعر: من الأقل' },
        { value: 'price_desc', label: 'السعر: من الأعلى' },
        { value: 'rating_desc',label: 'الأعلى تقييماً' },
        { value: 'newest',     label: 'الأحدث' },
      ]
    : [
        { value: '',           label: 'Pertinence' },
        { value: 'price_asc',  label: 'Prix croissant' },
        { value: 'price_desc', label: 'Prix décroissant' },
        { value: 'rating_desc',label: 'Mieux notés' },
        { value: 'newest',     label: 'Plus récents' },
      ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sticky top-32">

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          {ar ? 'ترتيب النتائج' : 'Trier par'}
        </label>
        <select
          {...register('sort')}
          className="w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {ar ? 'نطاق السعر (درهم / ليلة)' : 'Fourchette de prix (MAD / nuit)'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              {...register('min_price', { valueAsNumber: true })}
              placeholder={ar ? 'من' : 'Min'}
              className="w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <input
              type="number"
              {...register('max_price', { valueAsNumber: true })}
              placeholder={ar ? 'إلى' : 'Max'}
              className="w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {ar ? 'عدد الغرف' : 'Nombre de chambres'}
        </label>
        <div className="flex gap-2 flex-wrap">
          {[undefined, 1, 2, 3, 4].map(n => (
            <label key={String(n)} className="cursor-pointer">
              <input type="radio" value={n ?? ''} {...register('bedrooms')} className="sr-only" />
              <span className={cn(
                'inline-flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-medium transition-colors',
                'hover:border-primary hover:bg-primary/5',
              )}>
                {n === undefined ? (ar ? 'الكل' : 'Tous') : n === 4 ? `${n}+` : n}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {ar ? 'عدد الحمامات' : 'Salles de bain'}
        </label>
        <div className="flex gap-2 flex-wrap">
          {[undefined, 1, 2, 3].map(n => (
            <label key={String(n)} className="cursor-pointer">
              <input type="radio" value={n ?? ''} {...register('bathrooms')} className="sr-only" />
              <span className={cn(
                'inline-flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-medium transition-colors',
                'hover:border-primary hover:bg-primary/5',
              )}>
                {n === undefined ? (ar ? 'الكل' : 'Tous') : n === 3 ? `${n}+` : n}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            {ar ? 'المرافق' : 'Équipements'}
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <Controller
              control={control}
              name="amenities"
              render={({ field }) => (
                <>
                  {amenities.map(a => (
                    <label key={a.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={a.id}
                        checked={field.value?.includes(a.id)}
                        onChange={e => {
                          const current = field.value || []
                          field.onChange(
                            e.target.checked
                              ? [...current, a.id]
                              : current.filter(id => id !== a.id)
                          )
                        }}
                        className="w-4 h-4 rounded-md border-border accent-primary"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {ar ? (a.name?.ar ?? a.name_ar) : (a.name?.fr ?? a.name_fr ?? a.name?.ar ?? a.name_ar)}
                      </span>
                    </label>
                  ))}
                </>
              )}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 h-10 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {ar ? 'تطبيق' : 'Appliquer'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="h-10 px-4 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          {ar ? 'مسح' : 'Effacer'}
        </button>
      </div>
    </form>
  )
}
