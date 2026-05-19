import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Providers } from '@/components/layout/Providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    template: '%s | شمال كوم - ChamalCom',
    default:  'شمال كوم | منصة الإيجار الموسمي في وادي لاو',
  },
  description: 'اكتشف أجمل الشقق والفلل والمنازل للإيجار الموسمي في وادي لاو، شمال المغرب. حجز آمن وسهل.',
  keywords:    ['وادي لاو', 'إيجار موسمي', 'شمال المغرب', 'شاليه', 'فيلا', 'Oued Laou', 'location saisonnière', 'Maroc'],
  authors:     [{ name: 'ChamalCom Team' }],
  creator:     'ChamalCom',
  publisher:   'ChamalCom',
  robots:      'index, follow',
  openGraph: {
    type:   'website',
    locale: 'ar_MA',
    url:    'https://chamalcom.ma',
    siteName: 'شمال كوم',
    title:    'شمال كوم | إيجار موسمي في وادي لاو',
    description: 'منصة رقمية لإيجار أفضل العقارات الموسمية في وادي لاو وشمال المغرب',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'ChamalCom' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'شمال كوم | وادي لاو',
    description: 'إيجار موسمي في وادي لاو وشمال المغرب',
    images:      ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon:  [{ url: '/favicon.ico' }, { url: '/icon-192.png', type: 'image/png', sizes: '192x192' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor:   [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }, { media: '(prefers-color-scheme: dark)', color: '#0f172a' }],
}

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params
  const messages = await getMessages()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={locale === 'ar' ? 'font-arabic' : 'font-latin'}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers locale={locale}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
