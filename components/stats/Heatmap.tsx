import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/Card';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';
import { ballsByDay } from '@/utils/stats';
import type { Session } from '@/types/session';

interface Props {
  sessions: Session[];
  weeks?: number;
}

export function Heatmap({ sessions, weeks = 12 }: Props) {
  const { c } = useTheme();
  const days = ballsByDay(sessions, weeks * 7);
  const max = Math.max(1, ...days.map((d) => d.balls));

  // Build columns of 7 days each (oldest week first, Sun → Sat)
  const cols: { day: number; balls: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const start = w * 7;
    cols.push(days.slice(start, start + 7));
  }

  return (
    <Card>
      <Text style={[styles.title, { color: c.textSecondary }]}>Activity · last 12 weeks</Text>
      <View style={styles.grid}>
        {cols.map((col, ci) => (
          <View key={ci} style={styles.col}>
            {col.map((d) => (
              <View
                key={d.day}
                style={[
                  styles.cell,
                  {
                    backgroundColor: cellColor(d.balls, max, c.surface2),
                    borderColor: c.border,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: c.textMuted }]}>Less</Text>
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <View
            key={i}
            style={[
              styles.legendCell,
              {
                backgroundColor: cellColor(p * max, max, c.surface2),
                borderColor: c.border,
              },
            ]}
          />
        ))}
        <Text style={[styles.legendText, { color: c.textMuted }]}>More</Text>
      </View>
    </Card>
  );
}

function cellColor(balls: number, max: number, base: string): string {
  if (balls <= 0) return base;
  const p = Math.min(1, balls / max);
  // brand red-orange gradient
  if (p < 0.25) return '#7A2920';
  if (p < 0.5) return '#A0362A';
  if (p < 0.75) return '#C73B2D';
  return '#E94B3C';
}

const styles = StyleSheet.create({
  title: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm },
  grid: { flexDirection: 'row', gap: 4 },
  col: { gap: 4, flex: 1 },
  cell: {
    aspectRatio: 1,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  legendText: { fontSize: 11 },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
