import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'MAD'): string {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string | Date, locale = 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date, locale = 'fr'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
    day: 'numeric', month: 'short',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').trim()
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + '…' : text
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidMoroccanPhone(phone: string): boolean {
  return /^(\+212|0)(5|6|7)\d{8}$/.test(phone.replace(/\s/g, ''))
}

export function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  return new URLSearchParams(filtered).toString()
}

export function getStarRating(rating: number): { full: number; half: boolean; empty: number } {
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return { full, half, empty }
}

export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay)
}

/** Map raw Laravel validation keys (e.g. "validation.email") to user-friendly messages */
const VALIDATION_MESSAGES: Record<string, { ar: string; fr: string }> = {
  'validation.email':            { ar: 'البريد الإلكتروني غير صالح',           fr: 'Email invalide' },
  'validation.required':         { ar: 'هذا الحقل مطلوب',                      fr: 'Ce champ est requis' },
  'validation.unique':           { ar: 'هذه القيمة مستخدمة بالفعل',            fr: 'Cette valeur est déjà utilisée' },
  'validation.min.string':       { ar: 'النص قصير جداً',                        fr: 'Texte trop court' },
  'validation.max.string':       { ar: 'النص طويل جداً',                        fr: 'Texte trop long' },
  'validation.min.numeric':      { ar: 'القيمة صغيرة جداً',                    fr: 'Valeur trop petite' },
  'validation.confirmed':        { ar: 'كلمتا المرور غير متطابقتين',            fr: 'Les mots de passe ne correspondent pas' },
  'validation.regex':            { ar: 'صيغة غير صالحة',                       fr: 'Format invalide' },
  'validation.exists':           { ar: 'القيمة المحددة غير صالحة',             fr: 'La valeur sélectionnée est invalide' },
  'validation.mimes':            { ar: 'نوع الملف غير مدعوم',                  fr: 'Type de fichier non supporté' },
  'validation.max.file':         { ar: 'الملف كبير جداً',                       fr: 'Fichier trop volumineux' },
  'The given data was invalid.': { ar: 'البيانات المدخلة غير صالحة',          fr: 'Les données saisies sont invalides' },
}

export function parseApiError(e: any, ar: boolean): string {
  const errs = e?.response?.data?.errors as Record<string, string[]> | undefined
  const msg  = e?.response?.data?.message as string | undefined

  if (errs) {
    const firstKey = Object.values(errs)[0]?.[0] ?? ''
    const mapped   = VALIDATION_MESSAGES[firstKey]
    if (mapped) return mapped[ar ? 'ar' : 'fr']
    if (firstKey && !firstKey.startsWith('validation.')) return firstKey
  }

  if (msg) {
    const mapped = VALIDATION_MESSAGES[msg]
    if (mapped) return mapped[ar ? 'ar' : 'fr']
    if (!msg.startsWith('validation.')) return msg
  }

  return ar ? 'حدث خطأ ما، حاول مجدداً' : 'Une erreur est survenue, réessayez'
}
