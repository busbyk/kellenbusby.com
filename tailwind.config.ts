import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Base theme colors that work in both modes with CSS variables
        'theme-bg': 'var(--theme-bg)',
        'theme-bg-surface': 'var(--theme-bg-surface)',
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-light': 'var(--theme-primary-light)',
        'theme-secondary': 'var(--theme-secondary)',
        'theme-secondary-light': 'var(--theme-secondary-light)',
        'theme-text': 'var(--theme-text)',
        'theme-text-subtle': 'var(--theme-text-subtle)',

        // Keep original theme colors for compatibility during migration
        'theme-gray': {
          default: '#344A53',
          mid: '#647B84',
          light: '#7C7484',
        },
        'theme-blue': {
          default: '#1481A0',
          light: '#7FB3C8',
        },
        'theme-purple': {
          default: '#5D3B60',
          light: '#837184',
        },
        'theme-orange': {
          default: '#E4634A',
          light: '#F59432',
        },
        'theme-white': '#FCF8FF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
} satisfies Config
