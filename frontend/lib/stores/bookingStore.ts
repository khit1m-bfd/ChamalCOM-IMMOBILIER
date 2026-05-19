'use client'

import { create } from 'zustand'
import { api } from '@/lib/api/client'

/** Matches the shape returned by BookingResource on the backend */
export interface Booking {
  id: string
  reference: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected'
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed'

  dates: {
    check_in: string
    check_out: string
    nights: number
  }

  guests: {
    adults: number
    children: number
    infants: number
    pets: number
    total: number
  }

  pricing: {
    base_price: number
    cleaning_fee: number
    service_fee: number
    security_deposit: number
    discount: number
    total: number
    currency: string
    refund_amount: number
  }

  property?: {
    id: string
    title: { ar: string; fr?: string }
    address: string
    cover_image?: string
    check_in_hour?: number
    check_out_hour?: number
  }

  guest?: {
    id: string
    name: string
    email: string
    avatar?: string
  }

  owner?: {
    id: string
    name: string
    avatar?: string
  }

  messages?: {
    guest?: string
    owner?: string
  }

  cancellation?: {
    cancelled_at: string
    reason?: string
    refund: number
  }

  can_cancel: boolean
  can_review: boolean
  confirmed_at?: string
  completed_at?: string
  created_at: string
}

export interface PriceQuote {
  price_per_night: number
  nights: number
  base_price: number
  cleaning_fee: number
  service_fee: number
  security_deposit: number
  total: number
  currency: string
}

interface BookingState {
  bookings: Booking[]
  currentBooking: Booking | null
  priceQuote: PriceQuote | null
  loading: boolean
  error: string | null

  fetchBookings:      (params?: Record<string, any>) => Promise<void>
  fetchBooking:       (id: string)                   => Promise<void>
  createBooking:      (data: CreateBookingData)      => Promise<Booking>
  cancelBooking:      (id: string, reason?: string)  => Promise<void>
  fetchPriceQuote:    (propertyId: string, checkIn: string, checkOut: string) => Promise<void>
  clearPriceQuote:    ()                             => void
}

export interface CreateBookingData {
  property_id:    string
  check_in_date:  string
  check_out_date: string
  adults:         number
  children?:      number
  infants?:       number
  pets?:          number
  message?:       string
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings:       [],
  currentBooking: null,
  priceQuote:     null,
  loading:        false,
  error:          null,

  fetchBookings: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      // Backend: { success:true, data:{ items:Booking[], pagination:{...} } }
      const { data } = await api.get('/bookings', { params })
      set({ bookings: data.items || [] })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchBooking: async (id) => {
    set({ loading: true, error: null })
    try {
      // Backend: { success:true, data: BookingResource }
      const { data } = await api.get(`/bookings/${id}`)
      set({ currentBooking: data })
    } catch (e: any) {
      set({ error: e.message })
    } finally {
      set({ loading: false })
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true, error: null })
    try {
      // Backend: { success:true, data:{ booking: BookingResource, payment_intent:{...} } }
      const { data } = await api.post('/bookings', bookingData)
      const booking = data.booking
      set(s => ({ bookings: [booking, ...s.bookings], currentBooking: booking }))
      return booking
    } catch (e: any) {
      set({ error: e.message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  cancelBooking: async (id, reason) => {
    set({ loading: true, error: null })
    try {
      // Backend: { success:true, data: BookingResource }
      const { data } = await api.post(`/bookings/${id}/cancel`, { reason })
      set(s => ({
        bookings: s.bookings.map(b => b.id === id ? data : b),
        currentBooking: s.currentBooking?.id === id ? data : s.currentBooking,
      }))
    } catch (e: any) {
      set({ error: e.message })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  fetchPriceQuote: async (propertyId, checkIn, checkOut) => {
    set({ loading: true })
    try {
      // Backend: { success:true, data: PriceQuote }
      const { data } = await api.get(`/properties/${propertyId}/price-quote`, {
        params: { check_in: checkIn, check_out: checkOut },
      })
      set({ priceQuote: data })
    } catch { /* silent */ } finally {
      set({ loading: false })
    }
  },

  clearPriceQuote: () => set({ priceQuote: null }),
}))
