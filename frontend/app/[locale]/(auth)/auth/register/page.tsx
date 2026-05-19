'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Waves, Home, Users } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn, parseApiError } from '@/lib/utils'

const registerSchema = z.object({
  first_name:            z.string().min(2).max(50),
  last_name:             z.string().min(2).max(50),
  email:                 z.string().email(),
  phone:                 z.string().optional(),
  password:              z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain number'),
  password_confirmation: z.string(),
  role:                  z.enum(['client', 'owner']),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const locale       = useLocale()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const defaultRole  = (searchParams.get('role') as 'owner' | 'client') || 'client'

  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword]       = useState(false)
  const [serverError,  setServerError]        = useState('')

  const ar = locale === 'ar'

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  })

  const role = watch('role')

  const onSubmit = async (values: RegisterForm) => {
    setServerError('')
    try {
      const result = await registerUser({ ...values, locale: locale as 'ar' | 'fr' })
      const params = new URLSearchParams({ email: result.email })
      if (result.debugOtp) params.set('debug_otp', result.debugOtp)
      router.push(`/${locale}/auth/verify-email?${params.toString()}`)
    } catch (e: any) {
      setServerError(parseApiError(e, ar))
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left: Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-brand items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 moroccan-pattern opacity-10" />
        <div className="relative z-10 text-white text-center px-12">
          <div className="text-7xl mb-6">🌊</div>
          <h2 className="text-3xl font-bold mb-4">
            {ar ? 'انضم إلى مجتمعنا' : 'Rejoignez notre communauté'}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm mx-auto">
            {ar
              ? '+500 عقار في وادي لاو في انتظارك. سجّل الآن وابدأ رحلتك.'
              : '+500 propriétés à Oued Laou vous attendent. Inscrivez-vous maintenant.'
            }
          </p>
          <div className="flex justify-center gap-8 mt-10">
            {[
              { n: '500+', l: ar ? 'عقار' : 'Propriétés' },
              { n: '2k+',  l: ar ? 'مسافر' : 'Voyageurs' },
              { n: '4.9',  l: ar ? 'تقييم' : 'Note moy.' },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold">{n}</div>
                <div className="text-white/70 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          <Link href={`/${locale}`} className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">ChamalCom</span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {ar ? 'إنشاء حساب جديد' : 'Créer un compte'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {ar ? 'انضم إلى آلاف المسافرين والمضيفين' : 'Rejoignez des milliers de voyageurs et hôtes'}
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['client', 'owner'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setValue('role', r)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                  role === r
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40'
                )}
              >
                {r === 'client'
                  ? <Users className="w-6 h-6" />
                  : <Home className="w-6 h-6" />
                }
                <span className="text-sm font-medium">
                  {r === 'client'
                    ? (ar ? 'مسافر' : 'Voyageur')
                    : (ar ? 'مضيف / مالك' : 'Hôte / Propriétaire')
                  }
                </span>
              </button>
            ))}
          </div>

          {serverError && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 mb-5 border border-destructive/20">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: 'first_name' as const, label: ar ? 'الاسم' : 'Prénom' },
                { field: 'last_name'  as const, label: ar ? 'اللقب' : 'Nom' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
                  <div className="relative">
                    <User className={cn('absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                    <input
                      {...register(field)}
                      className={cn(
                        'w-full h-11 bg-muted rounded-xl border border-border text-sm transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                        ar ? 'pr-9 pl-3' : 'pl-9 pr-3',
                        errors[field] && 'border-destructive'
                      )}
                    />
                  </div>
                  {errors[field] && <p className="text-destructive text-xs mt-0.5">{ar ? 'مطلوب' : 'Requis'}</p>}
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {ar ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={cn(
                    'w-full h-11 bg-muted rounded-xl border border-border text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    ar ? 'pr-10 pl-3' : 'pl-10 pr-3',
                    errors.email && 'border-destructive'
                  )}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-0.5">{ar ? 'بريد غير صالح' : 'Email invalide'}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {ar ? 'رقم الهاتف (اختياري)' : 'Téléphone (optionnel)'}
              </label>
              <div className="relative">
                <Phone className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  type="tel"
                  {...register('phone')}
                  className={cn(
                    'w-full h-11 bg-muted rounded-xl border border-border text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    ar ? 'pr-10 pl-3' : 'pl-10 pr-3',
                  )}
                  placeholder="+212 6XX XXX XXX"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {ar ? 'كلمة المرور' : 'Mot de passe'}
              </label>
              <div className="relative">
                <Lock className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={cn(
                    'w-full h-11 bg-muted rounded-xl border border-border text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    ar ? 'pr-10 pl-10' : 'pl-10 pr-10',
                    errors.password && 'border-destructive'
                  )}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', ar ? 'left-3' : 'right-3')}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-0.5">{ar ? '8 أحرف على الأقل، حرف كبير ورقم' : 'Min 8 chars, 1 majuscule, 1 chiffre'}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {ar ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
              </label>
              <div className="relative">
                <Lock className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  type="password"
                  {...register('password_confirmation')}
                  className={cn(
                    'w-full h-11 bg-muted rounded-xl border border-border text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    ar ? 'pr-10 pl-3' : 'pl-10 pr-3',
                    errors.password_confirmation && 'border-destructive'
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.password_confirmation && <p className="text-destructive text-xs mt-0.5">{ar ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas'}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-brand text-white font-semibold rounded-2xl shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading
                ? (ar ? 'جارٍ التسجيل...' : 'Inscription en cours...')
                : (ar ? 'إنشاء الحساب' : 'Créer le compte')
              }
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {ar ? 'لديك حساب؟' : 'Déjà un compte ?'}{' '}
            <Link href={`/${locale}/auth/login`} className="text-primary font-semibold hover:underline">
              {ar ? 'سجّل الدخول' : 'Se connecter'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
