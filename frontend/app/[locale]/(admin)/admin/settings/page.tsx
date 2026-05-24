'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { Settings, Bell, Shield, Globe, Database, Palette } from 'lucide-react'

export default function AdminSettingsPage() {
  const locale = useLocale()
  const ar     = locale === 'ar'

  const sections = [
    {
      icon: Globe,
      title: ar ? 'إعدادات المنصة' : 'Paramètres de la plateforme',
      desc: ar ? 'اسم المنصة، الوصف، اللغة الافتراضية' : 'Nom, description, langue par défaut',
      color: 'text-primary bg-primary/10',
    },
    {
      icon: Bell,
      title: ar ? 'الإشعارات' : 'Notifications',
      desc: ar ? 'إعدادات البريد الإلكتروني والتنبيهات' : 'Paramètres email et alertes',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Shield,
      title: ar ? 'الأمان' : 'Sécurité',
      desc: ar ? 'سياسات كلمة المرور والمصادقة' : 'Politiques de mot de passe et authentification',
      color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Palette,
      title: ar ? 'المظهر' : 'Apparence',
      desc: ar ? 'الألوان والخطوط وتخصيص الواجهة' : 'Couleurs, polices et personnalisation',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Database,
      title: ar ? 'البيانات والنسخ الاحتياطي' : 'Données et sauvegarde',
      desc: ar ? 'تصدير البيانات والنسخ الاحتياطية التلقائية' : 'Export des données et sauvegardes automatiques',
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'إعدادات النظام' : 'Paramètres système'}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {ar ? 'إدارة إعدادات وتكوين المنصة' : 'Gérez la configuration de la plateforme'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map(({ icon: Icon, title, desc, color }) => (
          <button
            key={title}
            className="flex items-start gap-4 bg-card rounded-2xl border border-border p-5 text-start hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-muted/40 rounded-2xl border border-dashed border-border p-6 text-center">
        <Settings className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">
          {ar ? 'هذه الإعدادات ستكون متاحة في الإصدار القادم من المنصة' : 'Ces paramètres seront disponibles dans la prochaine version'}
        </p>
      </div>
    </div>
  )
}
