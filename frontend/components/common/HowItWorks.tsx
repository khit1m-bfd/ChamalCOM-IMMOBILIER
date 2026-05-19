'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Search, CalendarCheck, Home, Star } from 'lucide-react'

export function HowItWorks() {
  const locale = useLocale()

  const steps = locale === 'ar' ? [
    {
      icon: Search,
      step: '01',
      title: 'ابحث عن عقارك',
      description: 'استخدم محرك البحث المتقدم للعثور على العقار المثالي في وادي لاو حسب التواريخ والميزانية.',
      gradient: 'from-primary to-blue-400',
    },
    {
      icon: CalendarCheck,
      step: '02',
      title: 'احجز بثقة',
      description: 'اختر التواريخ المناسبة وأكد حجزك بشكل فوري أو انتظر موافقة المضيف. الدفع آمن 100%.',
      gradient: 'from-secondary to-teal-400',
    },
    {
      icon: Home,
      step: '03',
      title: 'استمتع بإقامتك',
      description: 'سجّل وصولك في الوقت المحدد واستمتع بجميع مرافق العقار والخدمات المتاحة.',
      gradient: 'from-sand-600 to-orange-400',
    },
    {
      icon: Star,
      step: '04',
      title: 'شارك تجربتك',
      description: 'بعد مغادرتك، قيّم إقامتك وساعد المسافرين الآخرين على اتخاذ قراراتهم.',
      gradient: 'from-purple-500 to-pink-400',
    },
  ] : [
    {
      icon: Search,
      step: '01',
      title: 'Recherchez',
      description: 'Utilisez notre moteur de recherche avancé pour trouver le logement idéal à Oued Laou.',
      gradient: 'from-primary to-blue-400',
    },
    {
      icon: CalendarCheck,
      step: '02',
      title: 'Réservez',
      description: 'Choisissez vos dates et confirmez votre réservation. Paiement 100% sécurisé.',
      gradient: 'from-secondary to-teal-400',
    },
    {
      icon: Home,
      step: '03',
      title: 'Profitez',
      description: 'Arrivez à l\'heure convenue et profitez de toutes les installations du logement.',
      gradient: 'from-sand-600 to-orange-400',
    },
    {
      icon: Star,
      step: '04',
      title: 'Partagez',
      description: 'Après votre séjour, laissez un avis et aidez les autres voyageurs.',
      gradient: 'from-purple-500 to-pink-400',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase block mb-2">
            {locale === 'ar' ? 'بسيط وسهل' : 'Simple et rapide'}
          </span>
          <h2 className="section-title">
            {locale === 'ar' ? 'كيف يعمل شمال كوم؟' : 'Comment ça marche?'}
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            {locale === 'ar'
              ? 'أربع خطوات بسيطة تفصلك عن إقامتك المثالية في وادي لاو'
              : 'Quatre étapes simples pour votre séjour idéal à Oued Laou'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-16 start-[12.5%] end-[12.5%] h-0.5 bg-gradient-to-r from-primary via-secondary to-purple-500 opacity-20" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center group"
            >
              {/* Step Number */}
              <div className="relative inline-flex mb-6">
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="absolute -top-2 -end-2 w-6 h-6 bg-foreground text-background rounded-full text-[10px] font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>

              <h3 className="font-bold text-foreground text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
