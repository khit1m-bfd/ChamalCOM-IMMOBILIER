'use client'

import { create } from 'zustand'
import { propertiesApi } from '@/lib/api/properties'

export interface PropertyCategory {
  id: string
  name: { ar: string; fr?: string }
  slug: string
  icon?: string
  properties_count?: number
}

export interface PropertyAmenity {
  id: string
  name: { ar: string; fr?: string }
  icon?: string
  category?: string
}

export interface PropertyImage {
  id: string
  url: string
  thumbnail?: string
  is_cover: boolean
  alt?: { ar?: string; fr?: string }
}

/** Matches the shape returned by PropertyResource on the backend */
export interface Property {
  id: string
  slug: string
  title: { ar: string; fr?: string }
  description?: { ar?: string; fr?: string }
  status: 'draft' | 'published' | 'suspended'
  is_featured: boolean
  is_verified: boolean
  is_favorited?: boolean

  category?: PropertyCategory

  pricing: {
    per_night: number
    per_week?: number | null
    per_month?: number | null
    currency: string
    cleaning_fee: number
    security_deposit: number
  }

  location: {
    street?: string
    city: string
    region?: string
    country?: string
    lat?: number | null
    lng?: number | null
  }

  capacity: {
    max_guests: number
    bedrooms: number
    bathrooms: number
    beds: number
  }

  rules: {
    min_nights: number
    max_nights?: number | null
    check_in_hour?: number | null
    check_out_hour?: number | null
    instant_booking: boolean
    pets_allowed: boolean
    smoking_allowed: boolean
    events_allowed: boolean
    children_allowed: boolean
    cancellation_policy: string
    house_rules?: { ar?: string; fr?: string }
  }

  images?: PropertyImage[]
  cover_image?: string | null
  amenities?: PropertyAmenity[]

  owner?: {
    id: string
    name: string
    avatar?: string
    is_verified_host: boolean
    host_since?: string
    languages_spoken?: string[]
  }

  stats: {
    rating_average: number
    rating_count: number
    views_count: number
    bookings_count: number
    favorites_count: number
  }

  reviews?: any[]
  created_at?: string
}

export interface SearchParams {
  city?: string
  check_in?: string
  check_out?: string
  guests?: number
  category_id?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  amenities?: string[]
  page?: number
  per_page?: number
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest'
}

export interface PaginatedProperties {
  data: Property[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface PropertyState {
  featured:   Property[]
  categories: PropertyCategory[]
  amenities:  PropertyAmenity[]
  properties: PaginatedProperties | null
  currentProperty: Property | null
  favorites:  Property[]
  searchParams: SearchParams
  loading:    boolean
  error:      string | null

  fetchFeatured:      ()                              => Promise<void>
  fetchCategories:    ()                              => Promise<void>
  fetchAmenities:     ()                              => Promise<void>
  searchProperties:   (params: SearchParams)          => Promise<void>
  fetchProperty:      (id: string)                    => Promise<void>
  fetchFavorites:     ()                              => Promise<void>
  toggleFavorite:     (id: string)                    => Promise<void>
  setSearchParams:    (params: Partial<SearchParams>) => void
  clearCurrentProperty: ()                            => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  featured:        [],
  categories:      [],
  amenities:       [],
  properties:      null,
  currentProperty: null,
  favorites:       [],
  searchParams:    {},
  loading:         false,
  error:           null,

  fetchFeatured: async () => {
    if (get().featured.length > 0) return
    set({ loading: true, error: null })
    try {
      // Backend: { success: true, data: Property[] }
      // api.get already unwraps axios envelope → returns { success, data }
      // so destructured `data` IS the array directly
      const { data } = await propertiesApi.featured()
      set({ featured: Array.isArray(data) ? data : [] })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchCategories: async () => {
    if (get().categories.length > 0) return
    set({ loading: true })
    try {
      // Backend: { success: true, data: PropertyCategory[] }
      const { data } = await propertiesApi.categories()
      set({ categories: Array.isArray(data) ? data : [] })
    } catch {} finally {
      set({ loading: false })
    }
  },

  fetchAmenities: async () => {
    if (get().amenities.length > 0) return
    set({ loading: true })
    try {
      // Backend: { success: true, data: { [category]: Amenity[] } } (grouped)
      // Flatten the grouped object into a flat array
      const { data } = await propertiesApi.amenities()
      const flat: PropertyAmenity[] = Array.isArray(data)
        ? data
        : Object.values(data as Record<string, PropertyAmenity[]>).flat()
      set({ amenities: flat })
    } catch {} finally {
      set({ loading: false })
    }
  },

  searchProperties: async (params) => {
    set({ loading: true, error: null, searchParams: params })
    try {
      // Backend: { success: true, data: { items: Property[], pagination: {...} } }
      // api.get unwraps axios → { success, data }
      // destructured `data` = { items: [...], pagination: { total, per_page, current_page, last_page, ... } }
      const { data } = await propertiesApi.search(params)
      set({
        properties: {
          data: data.items || [],
          meta: {
            current_page: data.pagination?.current_page ?? 1,
            last_page:    data.pagination?.last_page    ?? 1,
            per_page:     data.pagination?.per_page     ?? 12,
            total:        data.pagination?.total        ?? 0,
          },
        },
      })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchProperty: async (id) => {
    set({ loading: true, error: null, currentProperty: null })
    try {
      // Backend: { success: true, data: Property, is_favorited: bool }
      // api.get unwraps axios → { success, data, is_favorited }
      // destructured `data` IS the property object
      const { data, is_favorited } = await propertiesApi.getOne(id)
      set({ currentProperty: { ...data, is_favorited: is_favorited ?? false } })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchFavorites: async () => {
    try {
      // Backend: { success: true, data: Property[] }
      const { data } = await propertiesApi.getFavorites()
      set({ favorites: Array.isArray(data) ? data : [] })
    } catch {}
  },

  toggleFavorite: async (id) => {
    try {
      await propertiesApi.toggleFavorite(id)
      const { featured, favorites, currentProperty } = get()

      set({
        featured: featured.map(p => p.id === id ? { ...p, is_favorited: !p.is_favorited } : p),
        favorites: favorites.some(p => p.id === id)
          ? favorites.filter(p => p.id !== id)
          : favorites,
        currentProperty: currentProperty?.id === id
          ? { ...currentProperty, is_favorited: !currentProperty.is_favorited }
          : currentProperty,
      })
    } catch (e: any) {
      throw e // re-throw so the UI can display a toast/error if needed
    }
  },

  setSearchParams: (params) => {
    set(s => ({ searchParams: { ...s.searchParams, ...params } }))
  },

  clearCurrentProperty: () => set({ currentProperty: null }),
}))
