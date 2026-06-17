import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Drill } from '@/types/drill';
import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING } from '@/constants/theme';
import { relativeDay } from '@/utils/time';

interface Props {
  drill: Drill;
  onPress?: () => void;
}

export const RecentDrillCard = memo(function RecentDrillCard({ drill, onPress }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
          overflow: 'hidden',
        },
      ]}
    >
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
      <LinearGradient
        colors={
          isDark
            ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)']
            : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.bar, { backgroundColor: drill.color }]} />
      <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={2}>
        {drill.name}
      </Text>
      <Text style={[styles.last, { color: c.textMuted }]}>
        {drill.lastUsedAt ? relativeDay(drill.lastUsedAt) : 'Not used yet'}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 160,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  bar: { height: 4, borderRadius: 2, width: 36 },
  name: { fontSize: 14, fontWeight: '700' },
  last: { fontSize: 11 },
});
