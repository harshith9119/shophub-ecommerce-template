/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#faf8f4',
        cream: '#f5f0e8',
        gold: {
          DEFAULT: '#c5a059',
          light: '#d4b87a',
          dark: '#a6843d',
        },
        emerald: {
          DEFAULT: '#064e3b',
          light: '#0a6b52',
          dark: '#043d2d',
        },
        charcoal: '#1a1a1a',
        muted: '#6b6560',
        surface: {
          page: 'var(--bg-page)',
          card: 'var(--bg-card)',
          alt: 'var(--bg-alt)',
          elevated: 'var(--bg-elevated)',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.35em',
        wide: '0.2em',
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        'marquee-slow': 'marquee 50s linear infinite',
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'scale-in': 'scaleIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'ken-burns': 'kenBurns 20s ease-out infinite alternate',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.12)' },
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'gold-gradient': 'linear-gradient(135deg, #c5a059 0%, #d4b87a 50%, #a6843d 100%)',
        'hero-overlay': 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)',
      },
      boxShadow: {
        luxury: '0 25px 50px -12px rgba(6, 78, 59, 0.12)',
        'luxury-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.2)',
        gold: '0 4px 20px rgba(197, 160, 89, 0.35)',
      },
    },
  },
  plugins: [],
};
