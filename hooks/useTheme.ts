import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';
import { COLORS } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  bgWarm: string;
  surface: string;
  surface2: string;
  surfaceSolid: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  glassTint: 'light' | 'dark';
  glassIntensity: number;
  brand: string;
  brandGlow: string;
  status: typeof COLORS.status;
}

export function useTheme(): { mode: ThemeMode; c: ThemeColors } {
  const pref = useSettingsStore((s) => s.theme);
  const system = useColorScheme();
  const mode: ThemeMode =
    pref === 'system' ? (system === 'light' ? 'light' : 'dark') : pref;
  const base = mode === 'light' ? COLORS.light : COLORS.dark;
  return {
    mode,
    c: {
      ...base,
      brand: COLORS.brand,
      brandGlow: COLORS.brandGlow,
      status: COLORS.status,
    },
  };
}
