/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "index.html",
    "src/**/*.{js,ts,jsx,tsx}",
    "src/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fifa: {
          blue: '#009CDE',
          'blue-dark': '#007AB0',
          navy: {
            950: '#001020',
            900: '#001a33',
            800: '#003366',
            700: '#005599',
            600: '#0077BB',
          },
          gold: '#FFD700',
          'gold-soft': '#E6C200',
        },
        pitch: {
          light: '#3d9b4a',
          base: '#2d7a3a',
          dark: '#1f5c2a',
          deep: '#16441d',
          line: 'rgba(255,255,255,0.18)',
        },
        stat: {
          fit: '#10b981',
          doubt: '#f59e0b',
          injured: '#ef4444',
          suspended: '#8b5cf6',
        },
        fdr: {
          easy: '#10b981',
          medium: '#f59e0b',
          hard: '#ef4444',
        },
        surface: {
          DEFAULT: '#11161d',
          elev: '#171d24',
          hover: '#1c242e',
          border: '#1f2937',
          'border-light': '#2a3441',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Roboto Condensed"', 'sans-serif'],
        heading: ['"Roboto Condensed"', 'sans-serif'],
        body: ['"Roboto"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'monospace'],
      },
      borderRadius: {
        glass: '16px',
        'glass-lg': '24px',
        'glass-xl': '32px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.32)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.45)',
        glow: '0 0 24px rgba(255, 215, 0, 0.4)',
        'glow-green': '0 0 24px rgba(16, 185, 129, 0.45)',
        'pitch-inset': 'inset 0 0 80px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        glass: '16px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255, 215, 0, 0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      spacing: {
        'slot': '72px',
        'slot-sm': '56px',
      },
    },
  },
  plugins: [],
}
