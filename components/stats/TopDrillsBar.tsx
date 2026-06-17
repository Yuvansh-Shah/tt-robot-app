import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/Card';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';
import type { Session } from '@/types/session';
import { topDrills } from '@/utils/stats';

interface Props {
  sessions: Session[];
  count?: number;
}

export function TopDrillsBar({ sessions, count = 5 }: Props) {
  const { c } = useTheme();
  const rows = topDrills(sessions, count);
  const max = Math.max(1, ...rows.map((r) => r.balls));
  return (
    <Card>
      <Text style={[styles.title, { color: c.textSecondary }]}>Top drills</Text>
      {rows.length === 0 ? (
        <Text style={[styles.empty, { color: c.textMuted }]}>No data yet.</Text>
      ) : (
        rows.map((r) => (
          <View key={r.name} style={styles.row}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: c.textPrimary }]}
            >
              {r.name}
            </Text>
            <View style={[styles.barWrap, { backgroundColor: c.surface2 }]}>
              <View
                style={[
                  styles.bar,
                  { width: `${(r.balls / max) * 100}%`, backgroundColor: r.color },
                ]}
              />
            </View>
            <Text style={[styles.value, { color: c.textPrimary }]}>{r.balls}</Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm },
  empty: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 6,
  },
  name: { flex: 1, fontSize: 13 },
  barWrap: { flex: 1.5, height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 5 },
  value: { width: 50, fontSize: 13, fontWeight: '600', textAlign: 'right' },
});
