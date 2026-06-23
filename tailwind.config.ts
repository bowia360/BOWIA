import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#06090F',
        'bg-alt': '#080C14',
        'neon-blue': '#0066FF',
        'neon-blue-lt': '#3D8BFF',
        'bow-green': '#36E27B',
        'text-off': '#E8EDF5',
        'text-muted': '#8A99AD',
        'text-dim': '#5A6678',
      },
      fontFamily: {
        sora: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        bow: '18px',
        'bow-sm': '11px',
        'bow-lg': '26px',
      },
      boxShadow: {
        card: '0 20px 60px -20px rgba(0,0,0,.7)',
        glow: '0 0 0 1px rgba(0,102,255,.25), 0 18px 60px -12px rgba(0,102,255,0.45)',
        'btn-primary': '0 10px 30px -8px rgba(0,102,255,.45), inset 0 1px 0 rgba(255,255,255,.25)',
      },
      transitionTimingFunction: {
        bow: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
