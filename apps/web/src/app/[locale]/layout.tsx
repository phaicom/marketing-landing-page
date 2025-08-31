import type { Locale } from 'next-intl'
import { clsx } from 'clsx'
import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { getRequestContext } from '@/lib/request-context'
import './globals.css'

interface LayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

const inter = Inter({ subsets: ['latin'] })

// SEO Things
// export function generateStaticParams() {
//   return routing.locales.map((locale) => ({ locale }))
// }

// export async function generateMetadata(
//   props: Omit<LayoutProps, 'children'>,
// ) {
//   const { locale } = await props.params

//   const t = await getTranslations({
//     locale: locale as Locale,
//     namespace: 'LocaleLayout',
//   })

//   return {
//     title: t('title'),
//   }
// }

export default async function LocaleLayout({
  children,
}: LayoutProps) {
  const { country, langs, locale } = await getRequestContext()

  // Enable static rendering
  setRequestLocale(locale as Locale)

  return (
    <html className="h-full" lang={locale}>
      <body className={clsx(inter.className, 'flex h-full flex-col')}>
        <NextIntlClientProvider locale={locale as Locale}>
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
