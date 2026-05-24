'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/lib/api/auth'

export interface User {
  id: string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  phone?: string
  avatar?: string
  role: 'admin' | 'owner' | 'client'
  locale: 'ar' | 'fr'
  email_verified?: boolean
  email_verified_at?: string
  is_host_verified?: boolean
  two_factor_enabled?: boolean
  profile?: {
    bio?: string
    address_city?: string
    address?: string
    city?: string
    country?: string
    languages_spoken?: string[]
    identity_verified?: boolean
    is_verified_host?: boolean
    rating_average?: number
    rating_count?: number
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isInitialized: boolean

  initialize:     ()                                                      => Promise<void>
  login:          (email: string, password: string)                       => Promise<{ requires2FA?: boolean; email?: string }>
  register:       (data: RegisterData)                                    => Promise<{ email: string }>
  logout:         ()                                                      => Promise<void>
  verify2FA:      (tempToken: string, code: string)                       => Promise<void>
  verifyEmail:    (email: string, code: string)                           => Promise<void>
  resendOtp:      (email: string, purpose: string)                        => Promise<void>
  forgotPassword: (email: string)                                         => Promise<void>
  resetPassword:  (data: ResetPasswordData)                               => Promise<void>
  updateUser:     (user: Partial<User>)                                   => void
  setToken:       (token: string)                                         => void
}

export interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  role?: 'owner' | 'client'
  locale?: 'ar' | 'fr'
}

export interface ResetPasswordData {
  email: string
  token?: string  // URL param "token" (sent as "code" to backend)
  code?: string   // alternative field name
  password: string
  password_confirmation: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:          null,
      accessToken:   null,
      isLoading:     false,
      isInitialized: false,

      initialize: async () => {
        if (get().isInitialized) return
        const token = get().accessToken
        if (!token) {
          set({ isInitialized: true })
          return
        }
        try {
          set({ isLoading: true })
          // api.get('/auth/me') returns { success: true, data: UserResource }
          // api helper does .then(r => r.data) so we get the body directly
          // destructuring `data` gives us the UserResource object
          const { data } = await authApi.me()
          set({ user: data, isInitialized: true })
        } catch {
          set({ user: null, accessToken: null, isInitialized: true })
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          // api.post returns the full response body:
          // Normal:  { success: true, message: "...", data: { access_token, refresh_token, user, ... } }
          // 2FA:     { success: true, requires_2fa: true, temp_token: "...", message: "..." }
          const response = await authApi.login({ email, password })

          if (response.requires_2fa) {
            // Store temp_token for the 2FA verification page
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('2fa_temp_token', response.temp_token)
            }
            return { requires2FA: true, email }
          }

          const { access_token, refresh_token, user } = response.data
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token',  access_token)
            localStorage.setItem('refresh_token', refresh_token)
          }
          set({ accessToken: access_token, user })
          document.cookie = `access_token=${access_token}; path=/; SameSite=Lax`
          return {}
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (formData) => {
        set({ isLoading: true })
        try {
          // Response: { success: true, message: "...", data: UserResource, debug_otp?: string }
          const response = await authApi.register(formData)
          return { email: response.data.email, debugOtp: response.debug_otp }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') ?? undefined : undefined
          await authApi.logout(refreshToken)
        } catch { /* swallow */ } finally {
          set({ user: null, accessToken: null })
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            sessionStorage.removeItem('2fa_temp_token')
          }
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        }
      },

      verify2FA: async (tempToken, code) => {
        set({ isLoading: true })
        try {
          // Response: { success: true, message: "...", data: { access_token, refresh_token, user, ... } }
          const { data } = await authApi.verify2FA({ temp_token: tempToken, code })
          const { access_token, refresh_token, user } = data
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token',  access_token)
            localStorage.setItem('refresh_token', refresh_token)
          }
          set({ accessToken: access_token, user })
          document.cookie = `access_token=${access_token}; path=/; SameSite=Lax`
        } finally {
          set({ isLoading: false })
        }
      },

      verifyEmail: async (email, code) => {
        set({ isLoading: true })
        try {
          await authApi.verifyEmail({ email, code })
        } finally {
          set({ isLoading: false })
        }
      },

      resendOtp: async (email, purpose) => {
        await authApi.resendOtp({ email, purpose })
      },

      forgotPassword: async (email) => {
        set({ isLoading: true })
        try {
          await authApi.forgotPassword({ email })
        } finally {
          set({ isLoading: false })
        }
      },

      resetPassword: async (formData) => {
        set({ isLoading: true })
        try {
          await authApi.resetPassword(formData)
        } finally {
          set({ isLoading: false })
        }
      },

      updateUser: (partial) => {
        const current = get().user
        if (current) set({ user: { ...current, ...partial } })
      },

      setToken: (token) => {
        set({ accessToken: token })
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token)
        }
        document.cookie = `access_token=${token}; path=/; SameSite=Lax`
      },
    }),
    {
      name:    'chamalcom-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user:        state.user,
      }),
    }
  )
)
