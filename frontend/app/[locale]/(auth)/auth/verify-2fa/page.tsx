'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Shield, Waves } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { cn } from '@/lib/utils'

export default function Verify2FAPage() {
  const locale       = useLocale()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') || ''

  const { verify2FA, resendOtp, isLoading } = useAuthStore()
  const [otp,         setOtp]         = useState(['', '', '', '', '', ''])
  const [error,       setError]       = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const ar   = locale === 'ar'

  // Retrieve the temp_token stored during login
  const tempToken = typeof window !== 'undefined'
    ? sessionStorage.getItem('2fa_temp_token') || ''
    : ''

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
    if (text.length === 6) { setOtp(text.split('')); handleSubmit(text) }
  }

  const handleSubmit = async (code: string) => {
    setError('')
    try {
      // Use temp_token from sessionStorage; fall back to email for compatibility
      await verify2FA(tempToken || email, code)
      sessionStorage.removeItem('2fa_temp_token')
      router.push(`/${locale}`)
    } catch (e: any) {
      setError(e?.response?.data?.message || (ar ? 'رمز غير صحيح' : 'Code incorrect'))
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    try {
      await resendOtp(email, '2fa')
      setResendTimer(60)
    } catch { /* silent */ }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">ChamalCom</span>
        </Link>

        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {ar ? 'التحقق بخطوتين' : 'Vérification en deux étapes'}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {ar ? 'أدخل رمز التحقق المرسل إلى' : 'Entrez le code envoyé à'}{' '}
          <span className="text-primary font-medium" dir="ltr">{email}</span>
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-2xl px-4 py-3 mb-6 border border-destructive/20">
            {error}
          </div>
        )}

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
          {ar ? 'لم تستلم الرمز؟' : "Pas reçu ?"}{' '}
          {resendTimer > 0
            ? <span className="text-primary">{resendTimer}s</span>
            : <button onClick={handleResend} className="text-primary font-semibold hover:underline">{ar ? 'أعد الإرسال' : 'Renvoyer'}</button>
          }
        </p>
      </motion.div>
    </div>
  )
}
