import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tint?: string;
  style?: ViewStyle;
}

export function Pill({ label, active, onPress, tint, style }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  const accent = tint ?? COLORS.brand;
  const fg = active ? '#fff' : c.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          borderColor: active ? 'rgba(255,255,255,0.25)' : c.borderStrong,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {active ? (
        <LinearGradient
          colors={[accent, COLORS.brandDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.55)',
            },
          ]}
        />
      )}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 7,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
