'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Waves, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn } from '@/lib/utils'

const schema = z.object({ email: z.string().email() })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const locale = useLocale()
  const { forgotPassword, isLoading } = useAuthStore()
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')
  const ar = locale === 'ar'

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: Form) => {
    setError('')
    try {
      await forgotPassword(values.email)
      setSent(true)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'حدث خطأ' : 'Une erreur est survenue'))
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {ar ? 'تم إرسال الرابط!' : 'Lien envoyé !'}
          </h2>
          <p className="text-muted-foreground mb-2">
            {ar ? 'أرسلنا رابط إعادة تعيين كلمة المرور إلى:' : 'Nous avons envoyé un lien à :'}
          </p>
          <p className="text-primary font-semibold mb-8" dir="ltr">{getValues('email')}</p>
          <p className="text-muted-foreground text-sm mb-6">
            {ar
              ? 'تحقق من بريدك الإلكتروني واتبع التعليمات. الرابط صالح لمدة 60 دقيقة.'
              : 'Vérifiez votre boîte mail. Le lien est valable 60 minutes.'
            }
          </p>
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ArrowLeft className={cn('w-4 h-4', ar && 'rotate-180')} />
            {ar ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">ChamalCom</span>
        </Link>

        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className={cn('w-4 h-4', ar && 'rotate-180')} />
          {ar ? 'العودة' : 'Retour'}
        </Link>

        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Mail className="w-7 h-7 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {ar ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {ar
            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
            : 'Entrez votre email et nous vous enverrons un lien de réinitialisation.'
          }
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 mb-5 border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {ar ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <div className="relative">
              <Mail className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
              <input
                type="email"
                {...register('email')}
                className={cn(
                  'w-full h-12 bg-muted rounded-2xl border border-border text-sm transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  ar ? 'pr-10 pl-4' : 'pl-10 pr-4',
                  errors.email && 'border-destructive'
                )}
                placeholder="you@example.com"
                dir="ltr"
              />
            </div>
            {errors.email && <p className="text-destructive text-xs mt-1">{ar ? 'بريد إلكتروني غير صالح' : 'Email invalide'}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-brand text-white font-semibold rounded-2xl shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading
              ? (ar ? 'جارٍ الإرسال...' : 'Envoi en cours...')
              : (ar ? 'إرسال رابط الاسترداد' : 'Envoyer le lien')
            }
          </button>
        </form>
      </motion.div>
    </div>
  )
}
