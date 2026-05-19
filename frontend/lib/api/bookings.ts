import { api } from './client'

export const bookingsApi = {
  list:      (params?: Record<string, any>)         => api.get('/bookings',             { params }),
  getOne:    (id: string)                           => api.get(`/bookings/${id}`),
  create:    (data: Record<string, any>)            => api.post('/bookings',            data),
  cancel:    (id: string, reason?: string)          => api.post(`/bookings/${id}/cancel`, { reason }),
  confirm:   (id: string)                           => api.post(`/bookings/${id}/confirm`),
  reject:    (id: string, reason?: string)          => api.post(`/bookings/${id}/reject`, { reason }),
  complete:  (id: string)                           => api.post(`/bookings/${id}/complete`),
  review:    (id: string, data: { rating: number; comment: string }) => api.post(`/bookings/${id}/review`, data),

  // Owner-side
  ownerList: (params?: Record<string, any>)         => api.get('/owner/bookings',       { params }),

  // Admin-side
  adminList: (params?: Record<string, any>)         => api.get('/admin/bookings',       { params }),
}
