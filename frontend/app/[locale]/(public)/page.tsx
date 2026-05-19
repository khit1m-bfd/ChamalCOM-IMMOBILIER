import type { Metadata } from 'next'
import { HeroSection }         from '@/components/property/HeroSection'
import { SearchBar }           from '@/components/property/SearchBar'
import { FeaturedProperties }  from '@/components/property/FeaturedProperties'
import { CategoryFilter }      from '@/components/property/CategoryFilter'
import { HowItWorks }          from '@/components/common/HowItWorks'
import { Testimonials }        from '@/components/common/Testimonials'
import { StatsSection }        from '@/components/common/StatsSection'
import { CTASection }          from '@/components/common/CTASection'

export const metadata: Metadata = {
  title: 'شمال كوم | الرئيسية',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="relative z-20 -mt-12 md:-mt-20 px-4">
        <div className="max-w-5xl mx-auto">
          <SearchBar variant="floating" />
        </div>
      </div>
      <StatsSection />
      <CategoryFilter />
      <FeaturedProperties />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </>
  )
}
