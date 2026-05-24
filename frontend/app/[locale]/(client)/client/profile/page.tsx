'use client'

import React, { useState, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Camera, CheckCircle, Globe } from 'lucide-react'
import Image from 'next/image'
import { useAuthStore } from '@/lib/stores/authStore'
import { api } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  first_name: z.string().min(2),
  last_name:  z.string().min(2),
  phone:      z.string().optional(),
  bio:        z.string().max(500).optional(),
  city:       z.string().optional(),
  locale:     z.enum(['ar', 'fr']),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  current_password:      z.string().min(6),
  password:              z.string().min(8),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, { path: ['password_confirmation'] })
type PasswordForm = z.infer<typeof passwordSchema>

export default function ClientProfilePage() {
  const locale = useLocale()
  const ar     = locale === 'ar'
  const { user, updateUser } = useAuthStore()

  const [activeTab,     setActiveTab]     = useState<'profile' | 'security'>('profile')
  const [saving,        setSaving]        = useState(false)
  const [savingPw,      setSavingPw]      = useState(false)
  const [profileMsg,    setProfileMsg]    = useState('')
  const [pwMsg,         setPwMsg]         = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name:  user?.last_name  || '',
      phone:      user?.phone      || '',
      bio:        user?.profile?.bio     || '',
      city:       user?.profile?.city    || '',
      locale:     (user?.locale as 'ar' | 'fr') || 'ar',
    },
  })

  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSaveProfile = async (values: ProfileForm) => {
    setSaving(true)
    setProfileMsg('')
    try {
      const { data } = await api.put('/user/profile', values)
      updateUser(data.data)
      setProfileMsg(ar ? 'تم حفظ التغييرات بنجاح' : 'Profil mis à jour avec succès')
    } catch (e: any) {
      setProfileMsg(e?.response?.data?.message || (ar ? 'فشل الحفظ' : 'Échec de la sauvegarde'))
    } finally {
      setSaving(false)
    }
  }

  const onSavePassword = async (values: PasswordForm) => {
    setSavingPw(true)
    setPwMsg('')
    try {
      await api.put('/user/password', values)
      setPwMsg(ar ? 'تم تغيير كلمة المرور بنجاح' : 'Mot de passe modifié avec succès')
      resetPw()
    } catch (e: any) {
      setPwMsg(e?.response?.data?.message || (ar ? 'كلمة المرور الحالية غير صحيحة' : 'Mot de passe actuel incorrect'))
    } finally {
      setSavingPw(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const { data } = await api.post('/user/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateUser({ avatar: data.data?.avatar ?? data.avatar })
    } catch (e: any) {
      console.error('Avatar upload failed:', e?.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'ملفي الشخصي' : 'Mon profil'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{ar ? 'أدر معلوماتك الشخصية وكلمة مرورك' : 'Gérez vos informations et votre mot de passe'}</p>
      </div>

      {/* Avatar */}
      <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted">
            {user?.avatar ? (
              <Image src={user.avatar} alt={user.first_name} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                {user?.first_name?.[0]}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -end-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold text-foreground">{user?.first_name} {user?.last_name}</p>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
          {user?.email_verified_at && (
            <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
              <CheckCircle className="w-3 h-3" />
              {ar ? 'بريد موثّق' : 'Email vérifié'}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {[
          { key: 'profile',  label: ar ? 'المعلومات' : 'Informations' },
          { key: 'security', label: ar ? 'الأمان'    : 'Sécurité' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleProfile(onSaveProfile)}
          className="bg-card rounded-2xl border border-border p-6 space-y-5"
        >
          <h2 className="font-semibold text-foreground">{ar ? 'المعلومات الشخصية' : 'Informations personnelles'}</h2>

          {profileMsg && (
            <div className={cn('text-sm rounded-xl px-4 py-3 border', profileMsg.includes('نجاح') || profileMsg.includes('succès') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200' : 'bg-destructive/10 text-destructive border-destructive/20')}>
              {profileMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: 'first_name' as const, label: ar ? 'الاسم'  : 'Prénom', icon: User },
              { field: 'last_name'  as const, label: ar ? 'اللقب'  : 'Nom',    icon: User },
            ].map(({ field, label, icon: Icon }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                  <input
                    {...regProfile(field)}
                    className={cn('w-full h-10 bg-muted rounded-xl border border-border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', ar ? 'pr-10 pl-3' : 'pl-10 pr-3', profileErrors[field] && 'border-destructive')}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{ar ? 'رقم الهاتف' : 'Téléphone'}</label>
            <div className="relative">
              <Phone className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
              <input {...regProfile('phone')} dir="ltr" placeholder="+212 6XX XXX XXX"
                className={cn('w-full h-10 bg-muted rounded-xl border border-border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', ar ? 'pr-10 pl-3' : 'pl-10 pr-3')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{ar ? 'المدينة' : 'Ville'}</label>
              <input {...regProfile('city')}
                className="w-full h-10 bg-muted rounded-xl border border-border text-sm px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{ar ? 'اللغة المفضلة' : 'Langue préférée'}</label>
              <div className="relative">
                <Globe className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <select {...regProfile('locale')}
                  className={cn('w-full h-10 bg-muted rounded-xl border border-border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none', ar ? 'pr-10 pl-3' : 'pl-10 pr-3')}>
                  <option value="ar">العربية</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{ar ? 'نبذة عني' : 'Bio'}</label>
            <textarea {...regProfile('bio')} rows={3}
              placeholder={ar ? 'أخبر المضيفين عن نفسك...' : 'Parlez-vous aux hôtes...'}
              className="w-full bg-muted rounded-xl border border-border text-sm p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            <p className="text-muted-foreground text-xs mt-1">{ar ? 'حتى 500 حرف' : 'Max 500 caractères'}</p>
          </div>

          <button type="submit" disabled={saving}
            className="h-10 px-6 bg-gradient-brand text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
            {saving ? (ar ? 'جارٍ الحفظ...' : 'Enregistrement...') : (ar ? 'حفظ التغييرات' : 'Enregistrer')}
          </button>
        </motion.form>
      )}

      {activeTab === 'security' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handlePw(onSavePassword)}
          className="bg-card rounded-2xl border border-border p-6 space-y-5"
        >
          <h2 className="font-semibold text-foreground">{ar ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}</h2>

          {pwMsg && (
            <div className={cn('text-sm rounded-xl px-4 py-3 border', pwMsg.includes('نجاح') || pwMsg.includes('succès') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200' : 'bg-destructive/10 text-destructive border-destructive/20')}>
              {pwMsg}
            </div>
          )}

          {[
            { field: 'current_password'      as const, label: ar ? 'كلمة المرور الحالية'  : 'Mot de passe actuel' },
            { field: 'password'              as const, label: ar ? 'كلمة المرور الجديدة'  : 'Nouveau mot de passe' },
            { field: 'password_confirmation' as const, label: ar ? 'تأكيد كلمة المرور'    : 'Confirmer' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
              <div className="relative">
                <Lock className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', ar ? 'right-3' : 'left-3')} />
                <input type="password" {...regPw(field)}
                  className={cn('w-full h-10 bg-muted rounded-xl border border-border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary', ar ? 'pr-10 pl-3' : 'pl-10 pr-3', pwErrors[field] && 'border-destructive')} />
              </div>
              {pwErrors[field] && <p className="text-destructive text-xs mt-1">{ar ? 'مطلوب' : 'Requis'}</p>}
            </div>
          ))}

          <button type="submit" disabled={savingPw}
            className="h-10 px-6 bg-gradient-brand text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
            {savingPw ? (ar ? 'جارٍ الحفظ...' : 'Enregistrement...') : (ar ? 'تحديث كلمة المرور' : 'Mettre à jour')}
          </button>
        </motion.form>
      )}
    </div>
  )
}
