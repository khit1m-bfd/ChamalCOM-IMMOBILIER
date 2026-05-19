import { api } from './client'

export interface LoginPayload    { email: string; password: string; device_name?: string }
export interface RegisterPayload { first_name: string; last_name: string; email: string; password: string; password_confirmation: string; phone?: string; role?: string; locale?: string }
export interface AuthResponse    { access_token: string; refresh_token: string; expires_in: number; user: any }

export const authApi = {
  login:          (data: LoginPayload)      => api.post('/auth/login', data),
  register:       (data: RegisterPayload)   => api.post('/auth/register', data),
  logout:         (refreshToken?: string)   => api.post('/auth/logout', { refresh_token: refreshToken }),
  me:             ()                        => api.get('/auth/me'),
  refresh:        (refreshToken: string)    => api.post('/auth/refresh', { refresh_token: refreshToken }),

  // Accept objects so the store can pass { email, code } etc.
  verifyEmail:    (payload: { email: string; code: string })                => api.post('/auth/verify-email', payload),
  resendOtp:      (payload: { email: string; purpose: string })             => api.post('/auth/resend-otp', payload),
  forgotPassword: (payload: { email: string })                              => api.post('/auth/forgot-password', payload),
  // Support both `code` and `token` field names (pages use `token` from URL param, backend expects `code`)
  resetPassword:  (payload: { email: string; code?: string; token?: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', {
      email:                 payload.email,
      code:                  payload.code ?? payload.token,
      password:              payload.password,
      password_confirmation: payload.password_confirmation,
    }),
  verify2FA:      (payload: { temp_token: string; code: string })           => api.post('/auth/verify-2fa', payload),
}
