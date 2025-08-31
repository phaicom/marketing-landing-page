import { clsx } from 'clsx'
import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { getRequestContext } from '@/lib/request-context'
import './globals.css'

interface LayoutProps {
  children: React.ReactNode
  params: {
    locale: string
    slug?: string[]
  }
  searchParams: { country?: string }
}

const inter = Inter({ subsets: ['latin'] })

// SEO Things
// need a way to get country at build time eg -> app/[locale]/[country]/[slug]/page.tsx
// export async function generateStaticParams({ params, searchParams }: LayoutProps) {
//   const { slug } = params
//   const { country } = searchParams

//   if (!slug || slug.length === 0 || country === undefined || country.trim() === '') {
//     return []
//   }

//   const r = await fetch(
//     `${origin}/api/i18n-meta?slug=${slug[-1] || ''}&country=${country}`,
//     { cache: 'no-store' },
//   )

//   if (!r.ok) {
//     return []
//   }

//   const data = (await r.json()) as { languages: string[] }

//   return data.languages.map((locale) => ({ locale }))
// }

export async function generateMetadata() {
  const { locale } = await getRequestContext()

  // const t = await getTranslations({
  //   locale: locale as Locale,
  //   namespace: 'LocaleLayout',
  // })

  return {
    title: `${locale}`,
  }
}

export default async function LocaleLayout({
  children,
}: LayoutProps) {
  const { country, langs, locale } = await getRequestContext()

  // Enable static rendering
  setRequestLocale(locale)

  return (
    <html className="h-full" lang={locale}>
      <body className={clsx(inter.className, 'flex h-full flex-col')}>
        <NextIntlClientProvider>
          <header>
            <h1>
              locale:
              {' '}
              {locale}
            </h1>
            <p>
              langs:
              {' '}
              {langs.join(', ')}
            </p>
            <p>
              country:
              {' '}
              {country}
            </p>
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
