'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Waves, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  password:              z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  path: ['password_confirmation'],
  message: 'Passwords do not match',
})
type Form = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const locale       = useLocale()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''
  const email        = searchParams.get('email') || ''

  const { resetPassword, isLoading } = useAuthStore()
  const [showPw,  setShowPw]  = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')
  const ar = locale === 'ar'

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: Form) => {
    setError('')
    try {
      await resetPassword({ token, email, ...values })
      setDone(true)
      setTimeout(() => router.push(`/${locale}/auth/login`), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'فشل التحديث' : 'Échec de la mise à jour'))
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {ar ? 'تم تحديث كلمة المرور!' : 'Mot de passe mis à jour !'}
          </h2>
          <p className="text-muted-foreground">{ar ? 'جارٍ تحويلك...' : 'Redirection...'}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">ChamalCom</span>
        </Link>

        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-7 h-7 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {ar ? 'إنشاء كلمة مرور جديدة' : 'Nouveau mot de passe'}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {ar ? 'أدخل كلمة مرور قوية لحماية حسابك' : 'Choisissez un mot de passe sécurisé'}
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 mb-5 border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { field: 'password' as const, label: ar ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe' },
            { field: 'password_confirmation' as const, label: ar ? 'تأكيد كلمة المرور' : 'Confirmer' },
          ].map(({ field, label }, idx) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
              <div className="relative">
                <Lock className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input
                  type={showPw ? 'text' : 'password'}
                  {...register(field)}
                  className={cn(
                    'w-full h-12 bg-muted rounded-2xl border border-border text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    ar ? 'pr-10 pl-10' : 'pl-10 pr-10',
                    errors[field] && 'border-destructive'
                  )}
                  placeholder="••••••••"
                />
                {idx === 0 && (
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className={cn('absolute top-1/2 -translate-y-1/2', ar ? 'left-3' : 'right-3')}>
                    {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                )}
              </div>
              {errors[field] && (
                <p className="text-destructive text-xs mt-1">
                  {field === 'password'
                    ? (ar ? '8 أحرف على الأقل، حرف كبير ورقم' : 'Min 8 chars, 1 majuscule, 1 chiffre')
                    : (ar ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas')
                  }
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-brand text-white font-semibold rounded-2xl shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading
              ? (ar ? 'جارٍ الحفظ...' : 'Enregistrement...')
              : (ar ? 'تحديث كلمة المرور' : 'Mettre à jour')
            }
          </button>
        </form>
      </motion.div>
    </div>
  )
}
