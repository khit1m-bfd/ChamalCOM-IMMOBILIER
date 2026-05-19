'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

export function Footer() {
  const t      = useTranslations()
  const locale = useLocale()

  const footerLinks = {
    discover: [
      { href: `/${locale}/properties`, label: locale === 'ar' ? 'استكشف العقارات' : 'Explorer les logements' },
      { href: `/${locale}/properties?category=villa`, label: locale === 'ar' ? 'فلل' : 'Villas' },
      { href: `/${locale}/properties?category=appartement`, label: locale === 'ar' ? 'شقق' : 'Appartements' },
      { href: `/${locale}/properties?category=studio`, label: locale === 'ar' ? 'استوديوهات' : 'Studios' },
    ],
    host: [
      { href: `/${locale}/auth/register?role=owner`, label: locale === 'ar' ? 'أصبح مضيفاً' : 'Devenir hôte' },
      { href: `/${locale}/owner/dashboard`, label: locale === 'ar' ? 'لوحة المضيف' : 'Espace hôte' },
      { href: '#', label: locale === 'ar' ? 'دليل المضيف' : 'Guide de l\'hôte' },
    ],
    support: [
      { href: '#', label: t('footer.helpCenter') },
      { href: '#', label: locale === 'ar' ? 'شروط الاستخدام' : t('footer.termsOfService') },
      { href: '#', label: locale === 'ar' ? 'سياسة الخصوصية' : t('footer.privacyPolicy') },
      { href: '#', label: t('nav.contact') },
    ],
  }

  return (
    <footer className="bg-slate-900 text-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

      {/* Wave decoration */}
      <div className="relative overflow-hidden">
        <svg viewBox="0 0 1440 60" className="w-full fill-background" preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-xl">ش</span>
              </div>
              <div>
                <span className="font-bold text-xl block">
                  {locale === 'ar' ? 'شمال كوم' : 'ChamalCom'}
                </span>
                <span className="text-slate-400 text-xs">Oued Laou · Maroc</span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              {t('footer.aboutText')}
            </p>

            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{locale === 'ar' ? 'وادي لاو، تطوان، المغرب' : 'Oued Laou, Tétouan, Maroc'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span dir="ltr">+212 539 XX XX XX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>contact@chamalcom.ma</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {[
            { title: locale === 'ar' ? 'اكتشف' : 'Découvrir', links: footerLinks.discover },
            { title: locale === 'ar' ? 'المضيفون' : 'Hôtes', links: footerLinks.host },
            { title: t('footer.support'), links: footerLinks.support },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 text-sm hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {locale === 'ar' ? 'شمال كوم' : 'ChamalCom'}. {t('footer.rights')}
          </p>

          <p className="text-slate-500 text-sm">{t('footer.madeWith')}</p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {[
              { icon: Instagram, href: '#', label: 'Instagram' },
              { icon: Facebook,  href: '#', label: 'Facebook' },
              { icon: Twitter,   href: '#', label: 'Twitter' },
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
