import { api, apiClient } from './client'

export const propertiesApi = {
  search:          (params: Record<string, any>) => api.get('/properties', { params }),
  featured:        ()                            => api.get('/properties/featured'),
  getOne:          (id: string)                  => api.get(`/properties/${id}`),
  categories:      ()                            => api.get('/properties/categories'),
  amenities:       ()                            => api.get('/properties/amenities'),
  availability:    (id: string, month: number, year: number) => api.get(`/properties/${id}/availability`, { params: { month, year } }),
  priceQuote:      (id: string, checkIn: string, checkOut: string) => api.get(`/properties/${id}/price-quote`, { params: { check_in: checkIn, check_out: checkOut } }),
  create:          (data: any)                   => api.post('/properties', data),
  update:          (id: string, data: any)       => api.put(`/properties/${id}`, data),
  delete:          (id: string)                  => api.delete(`/properties/${id}`),
  uploadImages:    (id: string, files: File[])   => {
    const form = new FormData()
    files.forEach((f) => form.append('images[]', f))
    return apiClient.post(`/properties/${id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
  deleteImage:     (propertyId: string, imageId: string) => api.delete(`/properties/${propertyId}/images/${imageId}`),
  ownerProperties: (params?: Record<string, any>)        => api.get('/owner/properties', { params }),
  toggleFavorite:  (id: string)                 => api.post(`/properties/${id}/favorite`),
  getFavorites:    ()                            => api.get('/favorites'),
}
