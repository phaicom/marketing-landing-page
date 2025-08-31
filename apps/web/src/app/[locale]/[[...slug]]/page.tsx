import type { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getRequestContext } from '@/lib/request-context'

async function getServerData() {
  const { locale, slug } = await getRequestContext()
  return new Promise((resolve) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('Server Data Fetching', { locale, slug })
      resolve(true)
    }, 500)
  })
}

export default async function IndexPage() {
  const { country, langs, locale, slug } = await getRequestContext()

  if (!country || !Array.isArray(langs) || langs.length === 0) {
    notFound()
  }

  setRequestLocale(locale as Locale)

  await getServerData()

  return (
    <div className="flex flex-col gap-2 border-1 border-dotted p-2">
      <h2>Index Page</h2>
      <p>
        Page Locale:
        {' '}
        {locale}
      </p>
      <p>
        Slug:
        {' '}
        {slug || '<none>'}
      </p>
    </div>
  )
}
