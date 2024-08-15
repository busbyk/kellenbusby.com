import type { Config } from 'tailwindcss'

import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'theme-gray': {
          default: '#344A53',
          mid: '#647B84',
          light: '#7C7484'
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
        'theme-white': '#FCF8FF'
      }
    },
  },
  plugins: [],
} satisfies Config