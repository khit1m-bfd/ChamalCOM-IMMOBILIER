'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Mail, Waves, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn } from '@/lib/utils'

export default function VerifyEmailPage() {
  const locale       = useLocale()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') || ''
  const debugOtp     = searchParams.get('debug_otp') || ''

  const { verifyEmail, resendOtp, isLoading } = useAuthStore()

  const [otp,         setOtp]         = useState(['', '', '', '', '', ''])
  const [error,       setError]        = useState('')
  const [resendTimer, setResendTimer]  = useState(60)
  const [success,     setSuccess]      = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const ar = locale === 'ar'

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
    if (next.every(d => d)) handleSubmit(next.join(''))
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      handleSubmit(text)
    }
  }

  const handleSubmit = async (code: string) => {
    setError('')
    try {
      await verifyEmail(email, code)
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/auth/login`), 2000)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'رمز غير صحيح' : 'Code incorrect'))
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    try {
      await resendOtp(email, 'email_verification')
      setResendTimer(60)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'فشل الإرسال' : 'Échec de l\'envoi'))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {ar ? 'تم التحقق بنجاح!' : 'Email vérifié !'}
          </h2>
          <p className="text-muted-foreground">
            {ar ? 'جارٍ تحويلك لتسجيل الدخول...' : 'Redirection vers la connexion...'}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">ChamalCom</span>
        </Link>

        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {ar ? 'تحقق من بريدك الإلكتروني' : 'Vérifiez votre email'}
        </h1>
        <p className="text-muted-foreground text-sm mb-2">
          {ar ? 'أرسلنا رمز مكوّن من 6 أرقام إلى' : 'Nous avons envoyé un code à 6 chiffres à'}
        </p>
        <p className="text-primary font-semibold mb-8" dir="ltr">{email}</p>

        {debugOtp && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl px-4 py-3 mb-6 text-center">
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
              🛠 {ar ? 'وضع التطوير — رمز OTP :' : 'Mode développement — Code OTP :'}
            </p>
            <p className="text-2xl font-bold tracking-widest text-orange-700 dark:text-orange-300" dir="ltr">
              {debugOtp}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 mb-6 border border-destructive/20">
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-8" dir="ltr" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={cn(
                'w-12 h-14 text-center text-xl font-bold bg-muted rounded-2xl border-2 transition-all',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30',
                digit ? 'border-primary bg-primary/5' : 'border-border',
                error && 'border-destructive'
              )}
            />
          ))}
        </div>

        <button
          onClick={() => handleSubmit(otp.join(''))}
          disabled={isLoading || otp.some(d => !d)}
          className="w-full h-12 bg-gradient-brand text-white font-semibold rounded-2xl shadow-glow-blue hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (ar ? 'جارٍ التحقق...' : 'Vérification...') : (ar ? 'تأكيد' : 'Confirmer')}
        </button>

        <p className="text-sm text-muted-foreground">
          {ar ? 'لم تستلم الرمز؟' : "Vous n'avez pas reçu le code ?"}{' '}
          {resendTimer > 0 ? (
            <span className="text-primary">{resendTimer}s</span>
          ) : (
            <button onClick={handleResend} className="text-primary font-semibold hover:underline">
              {ar ? 'أعد الإرسال' : 'Renvoyer'}
            </button>
          )}
        </p>
      </motion.div>
    </div>
  )
}
