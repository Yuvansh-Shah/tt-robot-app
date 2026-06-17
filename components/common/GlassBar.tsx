import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  style?: ViewStyle;
}

/** Floating translucent bar — used for sticky bottom action toolbars. */
export function GlassBar({ children, position = 'bottom', style }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  return (
    <View
      style={[
        position === 'bottom'
          ? styles.bottom
          : styles.top,
        {
          borderColor: c.borderStrong,
          ...(position === 'bottom'
            ? { borderTopWidth: StyleSheet.hairlineWidth }
            : { borderBottomWidth: StyleSheet.hairlineWidth }),
        },
        style,
      ]}
    >
      <BlurView
        tint={c.glassTint}
        intensity={isDark ? 60 : 80}
        blurMethod={
          Platform.OS === 'android' ? 'dimezisBlurView' : undefined
        }
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          isDark
            ? ['rgba(8,8,12,0.45)', 'rgba(8,8,12,0.75)']
            : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.80)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});
