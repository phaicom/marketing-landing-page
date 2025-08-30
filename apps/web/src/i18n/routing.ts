import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'de', 'th', 'ar', 'it'],
  defaultLocale: 'en',
  // localePrefix: 'as-needed',
})
