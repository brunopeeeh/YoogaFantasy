// Design tokens — single source of truth for colors, radii, shadows, spacing.
// Usado em conjunto com tailwind.config.js (que expõe estes tokens como classes).

export const colors = {
  fifa: {
    blue: '#009CDE',
    blueDark: '#007AB0',
    navy: {
      950: '#001020',
      900: '#001a33',
      800: '#003366',
      700: '#005599',
      600: '#0077BB',
    },
    gold: '#FFD700',
    goldSoft: '#E6C200',
  },
  pitch: {
    light: '#3d9b4a',
    base: '#2d7a3a',
    dark: '#1f5c2a',
    deep: '#16441d',
    line: 'rgba(255,255,255,0.18)',
    lineStrong: 'rgba(255,255,255,0.32)',
  },
  status: {
    fit: '#10b981',
    fitDim: '#059669',
    doubt: '#f59e0b',
    doubtDim: '#d97706',
    injured: '#ef4444',
    injuredDim: '#dc2626',
    suspended: '#8b5cf6',
  },
  fdr: {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444',
  },
  surface: {
    bg: '#009CDE',
    card: '#11161d',
    cardElev: '#171d24',
    cardHover: '#1c242e',
    border: '#1f2937',
    borderLight: '#2a3441',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    textDim: '#6b7280',
  },
  glass: {
    bg: 'rgba(17, 22, 29, 0.55)',
    bgStrong: 'rgba(17, 22, 29, 0.75)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.14)',
  },
};

export const radii = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  pill: '9999px',
};

export const shadows = {
  glass: '0 8px 32px rgba(0, 0, 0, 0.32)',
  glassLg: '0 16px 48px rgba(0, 0, 0, 0.45)',
  glow: '0 0 24px rgba(255, 215, 0, 0.4)',
  glowGreen: '0 0 24px rgba(16, 185, 129, 0.45)',
  pitchInset: 'inset 0 0 80px rgba(0, 0, 0, 0.4)',
};

export const typography = {
  display: '"Bebas Neue", "Roboto Condensed", sans-serif',
  heading: '"Roboto Condensed", sans-serif',
  body: '"Roboto", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Roboto Mono", monospace',
};

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const transitions = {
  fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '320ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: { type: 'spring', stiffness: 400, damping: 28 },
};

export const AVATAR_FALLBACK = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231e3a5f'/%3e%3ccircle cx='50' cy='35' r='18' fill='%23fff' opacity='.25'/%3e%3cpath d='M20 75 Q50 50 80 75' fill='%23fff' opacity='.25'/%3e%3c/svg%3e";
