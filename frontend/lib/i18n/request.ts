import { getRequestConfig } from 'next-intl/server'

const locales = ['ar', 'fr']

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const resolvedLocale = locales.includes(requested as string) ? (requested as string) : 'ar'

  return {
    locale:   resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
    timeZone: 'Africa/Casablanca',
    now: new Date(),
    formats: {
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        long:  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      },
      number: {
        currency: {
          style:    'currency',
          currency: 'MAD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      },
    },
  }
})
