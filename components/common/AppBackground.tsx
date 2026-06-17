import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  children?: React.ReactNode;
}

/**
 * Moody ambient background — base color, soft linear gradient, and two warm
 * radial "orbs" of light. Glass surfaces composited on top pick up these tints
 * through the BlurView, giving the layered glassmorphic feel from the spec
 * exemplars.
 */
export function AppBackground({ children }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg }]}>
      <LinearGradient
        colors={
          isDark
            ? ['#13090A', '#08080C', '#0A0610']
            : ['#FBF4ED', '#F2EDE7', '#EDE3DA']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient
            id="orbWarm"
            cx="80%"
            cy="10%"
            rx="60%"
            ry="50%"
            fx="80%"
            fy="10%"
          >
            <Stop
              offset="0%"
              stopColor="#FF6B3D"
              stopOpacity={isDark ? 0.45 : 0.22}
            />
            <Stop offset="100%" stopColor="#FF6B3D" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="orbAmber"
            cx="10%"
            cy="95%"
            rx="70%"
            ry="55%"
            fx="10%"
            fy="95%"
          >
            <Stop
              offset="0%"
              stopColor="#F2A63B"
              stopOpacity={isDark ? 0.28 : 0.18}
            />
            <Stop offset="100%" stopColor="#F2A63B" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="orbCool"
            cx="50%"
            cy="60%"
            rx="55%"
            ry="40%"
            fx="50%"
            fy="60%"
          >
            <Stop
              offset="0%"
              stopColor="#3D2A50"
              stopOpacity={isDark ? 0.35 : 0}
            />
            <Stop offset="100%" stopColor="#3D2A50" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#orbCool)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#orbAmber)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#orbWarm)" />
      </Svg>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

interface GlowProps {
  size?: number;
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}

/**
 * Decorative warm glow blob — drop onto any screen for extra atmosphere.
 * Renders an SVG radial gradient ellipse so the edge is properly soft.
 */
export function GlowOrb({ size = 320, color = '#FF6B3D', opacity = 0.45, style }: GlowProps) {
  return (
    <Svg
      width={size}
      height={size}
      pointerEvents="none"
      style={[{ position: 'absolute' }, style]}
    >
      <Defs>
        <RadialGradient id="g" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={size / 2} cy={size / 2} rx={size / 2} ry={size / 2} fill="url(#g)" />
    </Svg>
  );
}
