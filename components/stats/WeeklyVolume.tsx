import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/Card';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, SPACING } from '@/constants/theme';
import type { Session } from '@/types/session';
import { ballsByWeek } from '@/utils/stats';

interface Props {
  sessions: Session[];
  weeks?: number;
}

export function WeeklyVolume({ sessions, weeks = 12 }: Props) {
  const { c } = useTheme();
  const data = ballsByWeek(sessions, weeks);
  const max = Math.max(1, ...data.map((d) => d.balls));
  return (
    <Card>
      <Text style={[styles.title, { color: c.textSecondary }]}>Weekly volume</Text>
      <View style={styles.bars}>
        {data.map((d, i) => {
          const h = (d.balls / max) * 100;
          return (
            <View key={d.weekStart} style={styles.col}>
              <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${h}%`,
                      backgroundColor: i === data.length - 1 ? COLORS.brand : c.surface2,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.axis}>
        <Text style={[styles.axisLabel, { color: c.textMuted }]}>{weeks} weeks ago</Text>
        <Text style={[styles.axisLabel, { color: c.textMuted }]}>This week</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm },
  bars: {
    flexDirection: 'row',
    height: 100,
    gap: 4,
    alignItems: 'flex-end',
  },
  col: { flex: 1, height: '100%' },
  bar: { borderRadius: 3, minHeight: 3 },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  axisLabel: { fontSize: 11 },
});
