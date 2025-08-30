import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { cache } from 'react'
import 'server-only'

export interface RequestContext {
  locale: string
  langs: string[]
  country: string
  slug: string
}

export const getRequestContext = cache(async (): Promise<RequestContext> => {
  const h = await headers()
  const locale = await getLocale()
  const langs = (h.get('x-available-langs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const country = (h.get('x-country') ?? 'en').toLowerCase()
  const slug = (h.get('x-slug') ?? '').toLowerCase()
  return { locale, langs, country, slug }
})
