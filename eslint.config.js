import configs from '@phaicom/eslint-config'

export default
configs(
  {
    tailwind: true,
    nextjs: true,
    react: true,
    formatters: true,
    rules: {
      'next/no-html-link-for-pages': 'off',
    },
  },
)
