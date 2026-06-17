import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Session } from '@/types/session';
import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING } from '@/constants/theme';
import { formatHhMm, relativeDay } from '@/utils/time';

interface Props {
  session: Session;
  onPress?: () => void;
}

export const SessionRow = memo(function SessionRow({ session, onPress }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  const dots = useMemo(() => {
    const seen = new Map<string, string>();
    for (const seg of session.segments) {
      const key = seg.drillId ?? seg.drillName;
      if (!seen.has(key)) seen.set(key, seg.drillColor);
    }
    return Array.from(seen.values()).slice(0, 5);
  }, [session]);
  const names = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const seg of session.segments) {
      if (!seen.has(seg.drillName)) {
        seen.add(seg.drillName);
        names.push(seg.drillName);
      }
    }
    return names;
  }, [session]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
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
      <View style={{ flex: 1 }}>
        <Text style={[styles.day, { color: c.textPrimary }]}>
          {relativeDay(session.startedAt)}
        </Text>
        <Text style={[styles.drills, { color: c.textSecondary }]} numberOfLines={1}>
          {names.join(' · ')}
        </Text>
        <View style={styles.dots}>
          {dots.map((color, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: color }]} />
          ))}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.balls, { color: c.textPrimary }]}>
          {session.totalBalls}
        </Text>
        <Text style={[styles.balls2, { color: c.textMuted }]}>balls</Text>
        <Text style={[styles.dur, { color: c.textSecondary }]}>
          {formatHhMm(session.durationMs)}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  day: { fontSize: 15, fontWeight: '700' },
  drills: { fontSize: 13, marginTop: 2 },
  dots: { flexDirection: 'row', gap: 4, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  balls: { fontSize: 22, fontWeight: '800' },
  balls2: { fontSize: 11 },
  dur: { fontSize: 12, marginTop: 4 },
});
