'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { Building2, Users, Star, Shield } from 'lucide-react'

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const isFloat = !Number.isInteger(end)
    const duration = 2500
    const steps    = 60
    const step     = end / steps
    let current    = 0
    const timer = setInterval(() => {
      current += step
      if (current >= end) { setCount(end); clearInterval(timer) }
      else { setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current)) }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, end])

  return <span ref={ref}>{count}{suffix}</span>
}

export function StatsSection() {
  const t      = useTranslations()
  const locale = useLocale()

  const stats = [
    {
      icon: Building2,
      value: 500,
      suffix: '+',
      label: locale === 'ar' ? 'عقار متاح' : 'Logements disponibles',
      gradient: 'from-primary to-primary/60',
    },
    {
      icon: Users,
      value: 5000,
      suffix: '+',
      label: locale === 'ar' ? 'ضيف سعيد' : 'Voyageurs satisfaits',
      gradient: 'from-secondary to-secondary/60',
    },
    {
      icon: Star,
      value: 4.9,
      suffix: '/5',
      label: locale === 'ar' ? 'متوسط التقييم' : 'Note moyenne',
      gradient: 'from-sand-600 to-sand-400',
      isFloat: true,
    },
    {
      icon: Shield,
      value: 100,
      suffix: '%',
      label: locale === 'ar' ? 'حجوزات آمنة' : 'Réservations sécurisées',
      gradient: 'from-green-500 to-green-400',
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
      <div className="page-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-3xl p-6 shadow-property text-center group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
