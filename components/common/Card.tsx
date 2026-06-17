import React from 'react';
import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { GLASS, RADIUS, SPACING } from '@/constants/theme';

interface Props extends ViewProps {
  padded?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
  /**
   * "blur"  → real BlurView. Best for top-level / hero surfaces.
   * "flat"  → translucent fill only. Cheaper; use in scrolling lists.
   * Default "blur".
   */
  variant?: 'blur' | 'flat';
  intensity?: number;
  radius?: number;
  tinted?: boolean;
}

export function Card({
  children,
  style,
  padded = true,
  variant = 'blur',
  intensity,
  radius = RADIUS.lg,
  tinted = false,
  ...rest
}: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  const padding = padded ? SPACING.md : 0;
  const blurIntensity =
    intensity ?? (isDark ? GLASS.intensityMedium : GLASS.intensityStrong);

  // Subtle inner gradient so the surface has a hint of top-light, like glass.
  const innerGradient: [string, string] = isDark
    ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)']
    : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.35)'];

  const tintBg = tinted
    ? isDark
      ? 'rgba(255,107,61,0.10)'
      : 'rgba(255,107,61,0.06)'
    : 'transparent';

  return (
    <View
      {...rest}
      style={[
        {
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.borderStrong,
          overflow: 'hidden',
          backgroundColor:
            variant === 'flat' ? c.surface : 'transparent',
        },
        style,
      ]}
    >
      {variant === 'blur' ? (
        <BlurView
          tint={c.glassTint}
          intensity={blurIntensity}
          blurMethod={
            Platform.OS === 'android' ? 'dimezisBlurView' : undefined
          }
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <LinearGradient
        colors={innerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {tinted ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: tintBg }]}
        />
      ) : null}
      <View style={{ padding }}>{children}</View>
    </View>
  );
}
