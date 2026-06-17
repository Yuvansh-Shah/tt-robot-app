import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Pill } from '@/components/common/Pill';
import { StatTile } from '@/components/common/StatTile';
import { EmptyState } from '@/components/common/EmptyState';
import { SessionRow } from '@/components/session/SessionRow';
import { Heatmap } from '@/components/stats/Heatmap';
import { TopDrillsBar } from '@/components/stats/TopDrillsBar';
import { WeeklyVolume } from '@/components/stats/WeeklyVolume';

import { useHistoryStore } from '@/stores/historyStore';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';
import { filterByRange, summarize } from '@/utils/stats';
import { formatHhMm } from '@/utils/time';

type Range = 'all' | '30d' | '7d';

export default function HistoryScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const sessions = useHistoryStore((s) => s.sessions);
  const [seg, setSeg] = useState<'sessions' | 'stats'>('sessions');
  const [range, setRange] = useState<Range>('all');

  const filtered = useMemo(() => filterByRange(sessions, range), [sessions, range]);
  const summary = useMemo(() => summarize(filtered), [filtered]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScreenHeader title="History" />

      <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm }}>
        <SegmentedControl<'sessions' | 'stats'>
          segments={[
            { value: 'sessions', label: 'Sessions' },
            { value: 'stats', label: 'Stats' },
          ]}
          value={seg}
          onChange={setSeg}
        />
      </View>

      {seg === 'sessions' ? (
        sessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            body="Start a drill to see your history here."
          />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ padding: SPACING.md, paddingBottom: 140, gap: SPACING.xs }}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={5}
            getItemLayout={(_data, index) => ({
              length: 88,
              offset: (88 + SPACING.xs) * index,
              index,
            })}
            renderItem={({ item }) => (
              <SessionRow
                session={item}
                onPress={() => router.push(`/session/${item.id}`)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.xs }} />}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={{ padding: SPACING.md, gap: SPACING.md, paddingBottom: 140 }}>
          <View style={styles.rangeRow}>
            <Pill label="All time" active={range === 'all'} onPress={() => setRange('all')} />
            <Pill label="30d" active={range === '30d'} onPress={() => setRange('30d')} />
            <Pill label="7d" active={range === '7d'} onPress={() => setRange('7d')} />
          </View>

          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <StatTile label="Sessions" value={`${summary.totalSessions}`} />
            <StatTile label="Time" value={formatHhMm(summary.totalDurationMs)} />
          </View>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <StatTile label="Balls" value={`${summary.totalBalls}`} />
            <StatTile label="Streak" value={`${summary.streak}d`} hint="consecutive days" />
          </View>

          <Heatmap sessions={sessions} />
          <TopDrillsBar sessions={filtered} />
          <WeeklyVolume sessions={sessions} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rangeRow: { flexDirection: 'row', gap: SPACING.xs },
});
