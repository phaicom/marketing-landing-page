import type { NextFetchEvent, NextRequest } from 'next/server'
import type { CustomMiddleware } from './chain'
import { NextResponse } from 'next/server'

const EXTERNAL_BASE = 'https://www.hfm.com'
const COOKIE_NAME = 'NEXT_LOCALE'

const isTwoLetter = (s: string) => /^[a-z]{2}$/i.test(s)

function notFound(req: NextRequest) {
  return NextResponse.rewrite(new URL('/404', req.url))
}

/**
 * Validate slug against CMS for a given country.
 * Returns { ok:false } if invalid. Otherwise provides languages and ready-to-use request headers.
 */
async function validateSlugAndHeaders(opts: {
  origin: string
  slug: string
  countryParam: string
  req: NextRequest
}) {
  const { origin, slug, countryParam, req } = opts
  const r = await fetch(
    `${origin}/api/i18n-meta?slug=${slug}&country=${countryParam}`,
    { cache: 'no-store' },
  )

  if (!r.ok) {
    return { ok: false as const }
  }

  const data = (await r.json()) as { languages?: string[], countries?: string[] }
  const languages = (data.languages ?? [])
  const countries = (data.countries ?? [])
  const countriesUpper = countries.map((c) => c.toUpperCase())
  const countryUpper = countryParam.toUpperCase()

  if (!countriesUpper.includes(countryUpper)) {
    return { ok: false as const }
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-available-langs', languages.join(','))
  requestHeaders.set('x-country', countryParam)
  requestHeaders.set('x-slug', slug)

  return {
    ok: true as const,
    languages,
    langsLower: languages.map((l) => l.toLowerCase()),
    defaultLang: languages[0]?.toLowerCase() || 'en',
    requestHeaders,
  }
}

function setLocaleCookie(res: NextResponse, locale: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: locale,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // eslint-disable-next-line node/prefer-global/process
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export function withI18nMiddleware(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const origin = req.nextUrl.origin
    const segments = req.nextUrl.pathname.split('/').filter(Boolean)
    const countryParam = req.nextUrl.searchParams.get('country') ?? 'en'

    // "/" → external default
    if (segments.length === 0) {
      return NextResponse.redirect(`${EXTERNAL_BASE}/en`)
    }

    // One segment
    if (segments.length === 1) {
      const seg = segments[0]

      // "/{locale}" → external same-locale (fallback handled by external)
      if (isTwoLetter(seg)) {
        const lang = seg.toLowerCase()
        return NextResponse.redirect(`${EXTERNAL_BASE}/${lang}`)
      }

      // "/{slug}" → validate and pass with headers (no explicit locale in path)
      const valid = await validateSlugAndHeaders({ origin, slug: seg, countryParam, req })
      if (!valid.ok) {
        return notFound(req)
      }

      const res = NextResponse.next({ request: { headers: valid.requestHeaders } })
      setLocaleCookie(res, valid.defaultLang)
      return middleware(req, event, res)
    }

    // Multi-segment
    const [first, ...restParts] = segments
    const rest = restParts.join('/')

    if (isTwoLetter(first)) {
      // Looks like a locale; check against CMS for this slug
      const locale = first.toLowerCase()
      const valid = await validateSlugAndHeaders({ origin, slug: rest, countryParam, req })
      if (!valid.ok) {
        return notFound(req)
      }

      // If locale is not allowed by CMS → redirect to the first allowed one
      if (valid.langsLower.length && !valid.langsLower.includes(locale)) {
        const targetLang = valid.defaultLang
        const url = req.nextUrl.clone()
        url.pathname = `/${targetLang}/${rest}`
        url.searchParams.set('country', countryParam)
        return NextResponse.redirect(url)
      }

      // Locale is allowed → pass through and set cookie
      const res = NextResponse.next({ request: { headers: valid.requestHeaders } })
      setLocaleCookie(res, locale)
      return middleware(req, event, res)
    }

    // No locale segment at all (nested slug path)
    const slugPath = segments.join('/')
    const valid = await validateSlugAndHeaders({ origin, slug: slugPath, countryParam, req })
    if (!valid.ok) {
      return notFound(req)
    }

    const res = NextResponse.next({ request: { headers: valid.requestHeaders } })
    setLocaleCookie(res, valid.defaultLang)
    return middleware(req, event, res)
  }
}
