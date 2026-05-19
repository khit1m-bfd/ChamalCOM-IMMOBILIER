'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import Image from 'next/image'

const TESTIMONIALS_AR = [
  {
    id: 1,
    name: 'فاطمة الزهراء بن علي',
    location: 'الرباط',
    avatar: 'https://ui-avatars.com/api/?name=فاطمة+بن+علي&background=1a78e8&color=fff&size=100',
    rating: 5,
    text: 'تجربة لا تُنسى في وادي لاو! الفيلا كانت أجمل مما وصفها الإعلان. المنظر الرائع على البحر والخدمة الممتازة جعلت إجازتنا العائلية مثالية. سنعود بالتأكيد.',
    property: 'فيلا لؤلؤة البحر المتوسط',
  },
  {
    id: 2,
    name: 'أحمد بن عمر',
    location: 'كازابلانكا',
    avatar: 'https://ui-avatars.com/api/?name=أحمد+بن+عمر&background=069880&color=fff&size=100',
    rating: 5,
    text: 'منصة شمال كوم رائعة وسهلة الاستخدام. الحجز كان سريعاً والمضيف متجاوب جداً. الشقة نظيفة ومجهزة بالكامل. أنصح بها بشدة لكل من يريد قضاء عطلته في الشمال.',
    property: 'شقة بانوراما',
  },
  {
    id: 3,
    name: 'نادية الشريف',
    location: 'مراكش',
    avatar: 'https://ui-avatars.com/api/?name=نادية+الشريف&background=d4901e&color=fff&size=100',
    rating: 5,
    text: 'زرت وادي لاو لأول مرة وكانت تجربة إقامتي عبر شمال كوم استثنائية. المنزل على الشاطئ مباشرة والأمواج تسمع من الغرفة. مكان سحري وخدمة احترافية.',
    property: 'فيلا الأطلس',
  },
]

const TESTIMONIALS_FR = [
  {
    id: 1,
    name: 'Marie Dupont',
    location: 'Paris, France',
    avatar: 'https://ui-avatars.com/api/?name=Marie+Dupont&background=1a78e8&color=fff&size=100',
    rating: 5,
    text: 'Un séjour inoubliable à Oued Laou! La villa était encore plus belle qu\'annoncée. La vue sur la mer et le service impeccable ont rendu nos vacances parfaites.',
    property: 'Villa Perle Méditerranée',
  },
  {
    id: 2,
    name: 'Thomas Martin',
    location: 'Lyon, France',
    avatar: 'https://ui-avatars.com/api/?name=Thomas+Martin&background=069880&color=fff&size=100',
    rating: 5,
    text: 'ChamalCom est une plateforme excellente et facile à utiliser. La réservation était rapide et l\'hôte très réactif. Appartement propre et entièrement équipé.',
    property: 'Appartement Panorama',
  },
  {
    id: 3,
    name: 'Sophie Bernard',
    location: 'Marseille, France',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Bernard&background=d4901e&color=fff&size=100',
    rating: 5,
    text: 'Première visite à Oued Laou et l\'expérience via ChamalCom était exceptionnelle. La maison est directement sur la plage, on entend les vagues depuis la chambre.',
    property: 'Villa Atlas',
  },
]

export function Testimonials() {
  const locale = useLocale()
  const testimonials = locale === 'ar' ? TESTIMONIALS_AR : TESTIMONIALS_FR
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="page-container">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase block mb-2">
            {locale === 'ar' ? 'ما يقوله ضيوفنا' : 'Ce que disent nos voyageurs'}
          </span>
          <h2 className="section-title">
            {locale === 'ar' ? 'تجارب حقيقية ومميزة' : 'Témoignages authentiques'}
          </h2>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-3xl p-8 md:p-12 shadow-property"
            >
              <Quote className="w-10 h-10 text-primary/20 mb-6" />

              <div className="flex mb-4">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-sand-500 text-sand-500" />
                ))}
              </div>

              <p className="text-foreground text-lg leading-relaxed mb-8">
                "{testimonials[current].text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src={testimonials[current].avatar}
                    alt={testimonials[current].name}
                    width={48} height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                  <p className="text-muted-foreground text-sm">{testimonials[current].location}</p>
                  <p className="text-primary text-xs mt-0.5">{testimonials[current].property}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={locale === 'ar' ? next : prev} className="w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-border hover:bg-primary/50'}`}
                />
              ))}
            </div>
            <button onClick={locale === 'ar' ? prev : next} className="w-10 h-10 rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
