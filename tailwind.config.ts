import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand Colors ──────────────────────────────
        green: {
          DEFAULT: '#1B5E37',
          dark:    '#0D3D20',
          mid:     '#2A7A4A',
          light:   '#E8F5EE',
        },
        gold: {
          DEFAULT: '#B8952A',
          light:   '#D4AF50',
          pale:    '#F0E4B8',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          dark:    '#EDE6D6',
        },
        // ── Text ──────────────────────────────────────
        ink: {
          DEFAULT: '#1A1A1A',
          mid:     '#3D3D3D',
          light:   '#6B6B6B',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['DM Sans', 'sans-serif'],
        arabic:  ['Amiri', 'serif'],
      },
      borderRadius: {
        card: '16px',
        xl2: '20px',
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.09)',
        cardL: '0 12px 48px rgba(0,0,0,0.16)',
        green: '0 8px 24px rgba(27,94,55,0.35)',
        gold:  '0 8px 24px rgba(184,149,42,0.35)',
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(135deg, #1B5E37 0%, #0D3D20 100%)',
        'gradient-gold':  'linear-gradient(135deg, #B8952A 0%, #D4AF50 100%)',
      },
    },
  },
  plugins: [],
}

export default config
