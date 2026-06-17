import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Layers, Target } from 'lucide-react-native';
import type { Drill } from '@/types/drill';
import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING } from '@/constants/theme';

interface Props {
  drill: Drill;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const DrillCard = memo(function DrillCard({ drill, onPress, onLongPress }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
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
      {/* Color glow along left edge */}
      <View
        style={[
          styles.colorGlow,
          { backgroundColor: drill.color, opacity: isDark ? 0.7 : 0.5 },
        ]}
      />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          {drill.type === 'sequence' ? (
            <Layers size={14} color={c.textSecondary} />
          ) : (
            <Target size={14} color={c.textSecondary} />
          )}
          <Text style={[styles.cat, { color: c.textMuted }]}>
            {drill.category.toUpperCase()}
          </Text>
        </View>
        <Text
          style={[styles.name, { color: c.textPrimary }]}
          numberOfLines={2}
        >
          {drill.name}
        </Text>
        <Text style={[styles.foot, { color: c.textMuted }]} numberOfLines={1}>
          {drill.isPreset ? 'Preset' : 'Custom'}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flex: 1,
    minHeight: 130,
  },
  colorGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  body: { padding: SPACING.sm + 2, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cat: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  name: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  foot: { fontSize: 11, marginTop: 2 },
});
