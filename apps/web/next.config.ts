import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin({
  /* config options here */
})

const config: NextConfig = {}

export default withNextIntl(config)
