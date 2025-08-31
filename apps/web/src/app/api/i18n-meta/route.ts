import { NextResponse } from 'next/server'

export const runtime = 'edge'

async function MockCMS() {
  // Simulate fetching data from a CMS
  return [
    {
      url: 'first-lp',
      languages: ['EN', 'DE', 'TH', 'AR'],
      countries: ['US', 'GB', 'DE', 'TH', 'AE'],
    },
    {
      url: 'second-lp',
      languages: ['EN', 'TH'],
      countries: ['JP', 'TH'],
    },
    {
      url: 'third-lp',
      languages: ['AR', 'EN', 'IT', 'DE'],
      countries: ['IT', 'DE', 'AE'],
    },
  ]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const country = searchParams.get('country')

  if (!slug || !country) {
    return NextResponse.json({}, { status: 400 })
  }

  const cmsRes = await MockCMS()
  if (!cmsRes || !Array.isArray(cmsRes)) {
    return NextResponse.json({}, { status: 404 })
  }

  const pageData = cmsRes.find((page) => page.url === slug && page.countries.includes(country.toUpperCase()))

  if (!pageData) {
    return NextResponse.json({}, { status: 404 })
  }

  const { languages, countries, ...rest } = pageData

  return NextResponse.json({
    languages: languages.map((lang) => lang.toLowerCase()),
    countries: countries.map((c) => c.toLowerCase()),
    ...rest,
  })
}
