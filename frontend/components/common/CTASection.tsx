'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { PlusCircle, Search, CheckCircle } from 'lucide-react'

export function CTASection() {
  const locale = useLocale()

  const benefits = locale === 'ar'
    ? ['تسجيل مجاني بدون عمولة', 'لوحة تحكم احترافية', 'دفع آمن ومباشر', 'دعم 24/7']
    : ['Inscription gratuite', 'Tableau de bord professionnel', 'Paiement sécurisé', 'Support 24/7']

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="page-container">
        <div className="relative bg-gradient-brand rounded-[2rem] overflow-hidden">

          {/* Background decoration */}
          <div className="absolute inset-0 moroccan-pattern opacity-10" />
          <div className="absolute -top-20 -end-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -start-10 w-48 h-48 bg-white/5 rounded-full" />

          <div className="relative z-10 p-8 md:p-16 grid md:grid-cols-2 gap-12 items-center">

            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: locale === 'ar' ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                {locale === 'ar' ? 'انضم كمضيف' : 'Devenez hôte'}
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                {locale === 'ar'
                  ? <>هل لديك عقار في وادي لاو؟ <br />حقّق أرباحاً إضافية</>
                  : <>Avez-vous un logement <br />à Oued Laou?</>
                }
              </h2>

              <p className="text-white/80 text-base leading-relaxed mb-6">
                {locale === 'ar'
                  ? 'انضم إلى مئات المضيفين وابدأ في تأجير عقارك للزوار القادمين إلى وادي لاو. سهل وسريع ومربح.'
                  : 'Rejoignez des centaines d\'hôtes et commencez à louer votre logement aux visiteurs d\'Oued Laou.'
                }
              </p>

              <ul className="space-y-2.5 mb-8">
                {benefits.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2.5 text-white/90 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
                    {b}
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/auth/register?role=owner`}
                  className="flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors text-sm shadow-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  {locale === 'ar' ? 'أضف عقارك الآن' : 'Ajouter mon logement'}
                </Link>
                <Link
                  href={`/${locale}/properties`}
                  className="flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors text-sm"
                >
                  <Search className="w-4 h-4" />
                  {locale === 'ar' ? 'استكشف العقارات' : 'Explorer'}
                </Link>
              </div>
            </motion.div>

            {/* Right: Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"
                  alt="Beautiful property"
                  className="w-full h-full object-cover"
                />
                {/* Earnings Card overlay */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute bottom-4 start-4 glass-dark rounded-2xl p-4"
                >
                  <p className="text-white/60 text-xs">
                    {locale === 'ar' ? 'أرباح هذا الشهر' : 'Revenus ce mois'}
                  </p>
                  <p className="text-white text-2xl font-bold mt-1">12,500 MAD</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-green-400 text-xs">↑ 23%</span>
                    <span className="text-white/50 text-xs">
                      {locale === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs mois dernier'}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
