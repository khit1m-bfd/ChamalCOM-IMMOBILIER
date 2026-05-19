'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Waves } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn, parseApiError } from '@/lib/utils'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const locale  = useLocale()
  const router  = useRouter()
  const { login, isLoading } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [serverError,  setServerError]  = useState('')

  const ar = locale === 'ar'

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginForm) => {
    setServerError('')
    try {
      const result = await login(values.email, values.password)
      if (result.requires2FA) {
        router.push(`/${locale}/auth/verify-2fa?email=${encodeURIComponent(result.email!)}`)
      } else {
        // Redirect to role-specific dashboard
        const role = useAuthStore.getState().user?.role
        if (role === 'owner') router.push(`/${locale}/owner/dashboard`)
        else if (role === 'admin') router.push(`/${locale}/admin/dashboard`)
        else router.push(`/${locale}/client/dashboard`)
      }
    } catch (e: any) {
      setServerError(parseApiError(e, ar) || (ar ? 'البريد أو كلمة المرور غير صحيحة' : 'Email ou mot de passe incorrect'))
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              ChamalCom
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {ar ? 'مرحباً بعودتك' : 'Bon retour !'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {ar ? 'سجّل الدخول للوصول إلى حسابك' : 'Connectez-vous à votre compte'}
          </p>

          {serverError && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 mb-6 border border-destructive/20">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {ar ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={cn(
                    'w-full h-12 bg-muted rounded-2xl border border-border text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    ar ? 'pr-10 pl-4' : 'pl-10 pr-4',
                    errors.email && 'border-destructive'
                  )}
                  placeholder={ar ? 'example@email.com' : 'example@email.com'}
                />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{ar ? 'بريد إلكتروني غير صالح' : 'Email invalide'}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">
                  {ar ? 'كلمة المرور' : 'Mot de passe'}
                </label>
                <Link href={`/${locale}/auth/forgot-password`} className="text-xs text-primary hover:underline">
                  {ar ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                </Link>
              </div>
              <div className="relative">
                <Lock className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn(
                    'w-full h-12 bg-muted rounded-2xl border border-border text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    ar ? 'pr-10 pl-10' : 'pl-10 pr-10',
                    errors.password && 'border-destructive'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors', ar ? 'left-3' : 'right-3')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{ar ? 'كلمة المرور مطلوبة' : 'Mot de passe requis'}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-brand text-white font-semibold rounded-2xl shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? (ar ? 'جارٍ تسجيل الدخول...' : 'Connexion en cours...')
                : (ar ? 'تسجيل الدخول' : 'Se connecter')
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">{ar ? 'أو' : 'ou'}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {ar ? 'ليس لديك حساب؟' : "Pas encore de compte ?"}{' '}
            <Link href={`/${locale}/auth/register`} className="text-primary font-semibold hover:underline">
              {ar ? 'سجّل الآن' : "S'inscrire"}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: Illustration (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-brand items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 moroccan-pattern opacity-10" />
        <div className="relative z-10 text-white text-center px-12">
          <div className="text-7xl mb-6">🏖️</div>
          <h2 className="text-3xl font-bold mb-4">
            {ar ? 'مرحباً في وادي لاو' : 'Bienvenue à Oued Laou'}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-xs mx-auto">
            {ar
              ? 'اكتشف أجمل العقارات في شمال المغرب بخطوات بسيطة'
              : 'Découvrez les plus belles propriétés du nord du Maroc'
            }
          </p>
        </div>
        {/* Floating cards */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-20 start-8 glass-dark rounded-2xl p-4 max-w-xs"
        >
          <p className="text-white/70 text-xs">{ar ? 'تقييم المستخدمين' : 'Note des utilisateurs'}</p>
          <div className="flex items-center gap-1 mt-1">
            {'★★★★★'.split('').map((s, i) => <span key={i} className="text-yellow-400">{s}</span>)}
            <span className="text-white font-bold ms-1">4.9/5</span>
          </div>
        </motion.div>
      </div>

    </div>
  )
}
