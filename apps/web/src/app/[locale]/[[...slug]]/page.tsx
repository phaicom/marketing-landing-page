import type { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

// Define PageProps type
interface PageProps {
  params: {
    locale: Locale
    slug?: string[]
  }
}

export default async function IndexPage({ params }: PageProps) {
  const { locale, slug } = await params

  // Enable static rendering
  setRequestLocale(locale as Locale)

  return (
    <div className="flex gap-2">
      <h1>
        Page
      </h1>
      <div className="flex flex-col gap-4">
        <p>
          Locale:
          {' '}
          {locale}
        </p>
        <p>
          {slug ? slug.join('/') : 'index'}
        </p>
      </div>
    </div>
  )
}
