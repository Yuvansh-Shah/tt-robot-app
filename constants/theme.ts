export const COLORS = {
  brand: '#FF6B3D',
  brandDark: '#E04A1F',
  brandLight: '#FF8A5C',
  brandGlow: '#FF6B3D',

  dark: {
    bg: '#08080C',
    bgWarm: '#1A0E0C',
    surface: 'rgba(255,255,255,0.06)',
    surface2: 'rgba(255,255,255,0.04)',
    surfaceSolid: '#15151B',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.18)',
    textPrimary: '#F5F2EE',
    textSecondary: '#A8A5AE',
    textMuted: '#6E6B76',
    glassTint: 'dark' as const,
    glassIntensity: 40,
  },

  light: {
    bg: '#F2EDE7',
    bgWarm: '#F8E9DF',
    surface: 'rgba(255,255,255,0.55)',
    surface2: 'rgba(255,255,255,0.40)',
    surfaceSolid: '#FFFFFF',
    border: 'rgba(15,15,30,0.08)',
    borderStrong: 'rgba(15,15,30,0.14)',
    textPrimary: '#1A1A1F',
    textSecondary: '#5A5660',
    textMuted: '#8A8690',
    glassTint: 'light' as const,
    glassIntensity: 60,
  },

  status: {
    ok: '#3DDC84',
    warn: '#FFB547',
    err: '#FF5C5C',
    info: '#5BC0FF',
  },
} as const;

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 32,
  pill: 999,
} as const;

export const FONT = {
  caption: 13,
  body: 17,
  title: 28,
} as const;

export const GLASS = {
  // multipliers used by GlassCard variants
  intensityWeak: 20,
  intensityMedium: 40,
  intensityStrong: 70,
} as const;
