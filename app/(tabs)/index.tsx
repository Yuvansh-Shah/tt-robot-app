import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Sparkles } from 'lucide-react-native';

import { ConnectionPill } from '@/components/common/ConnectionPill';
import { ConnectionSheet } from '@/components/common/ConnectionSheet';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { RecentDrillCard } from '@/components/drills/RecentDrillCard';
import { StatTile } from '@/components/common/StatTile';

import { useDrillStore } from '@/stores/drillStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { robot } from '@/services/robot';

import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';
import { formatHhMm } from '@/utils/time';
import { paramSummary } from '@/utils/format';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function HomeScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const drills = useDrillStore((s) => s.drills);
  const defaults = useSettingsStore((s) => s.defaults);
  const startSession = useSessionStore((s) => s.startSession);
  const sessions = useHistoryStore((s) => s.sessions);
  const isActive = useSessionStore((s) => s.isActive);

  const [showConn, setShowConn] = useState(false);

  const recent = useMemo(() => {
    return [...drills]
      .filter((d) => d.lastUsedAt)
      .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))
      .slice(0, 5);
  }, [drills]);

  const weekStats = useMemo(() => {
    const cutoff = Date.now() - WEEK_MS;
    const filtered = sessions.filter((s) => s.startedAt >= cutoff);
    return {
      count: filtered.length,
      duration: filtered.reduce((a, s) => a + s.durationMs, 0),
      balls: filtered.reduce((a, s) => a + s.totalBalls, 0),
    };
  }, [sessions]);

  const onQuickStart = async () => {
    startSession({ fallbackParams: defaults });
    try {
      await robot.start(defaults);
    } catch (e) {
      console.log('robot.start failed', e);
    }
    router.push('/session/active');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.app, { color: c.textPrimary }]}>TT Robot</Text>
            <Text style={[styles.tag, { color: c.textSecondary }]}>
              Train sharper, train more.
            </Text>
          </View>
          <ConnectionPill onPress={() => setShowConn(true)} />
        </View>

        {isActive ? (
          <Pressable
            onPress={() => router.push('/session/active')}
            style={[styles.activeBanner, { backgroundColor: c.brand }]}
          >
            <Text style={styles.activeText}>Session in progress · tap to return</Text>
          </Pressable>
        ) : null}

        <View style={{ paddingHorizontal: SPACING.md, gap: SPACING.md }}>
          <Card style={{ padding: SPACING.lg }} tinted>
            <Text style={[styles.heroLabel, { color: c.brand }]}>
              QUICK START
            </Text>
            <Text style={[styles.heroTitle, { color: c.textPrimary }]}>
              Start a free session
            </Text>
            <Text style={[styles.heroSub, { color: c.textSecondary }]}>
              {paramSummary(defaults)}
            </Text>
            <Button
              label="Start"
              size="lg"
              fullWidth
              leftIcon={<Play size={18} color="#fff" />}
              onPress={onQuickStart}
              style={{ marginTop: SPACING.md }}
            />
          </Card>

          <View>
            <Text style={[styles.section, { color: c.textPrimary }]}>This week</Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs }}>
              <StatTile label="Sessions" value={`${weekStats.count}`} />
              <StatTile label="Time" value={formatHhMm(weekStats.duration)} />
              <StatTile label="Balls" value={`${weekStats.balls}`} />
            </View>
          </View>

          <View>
            <View style={styles.sectionRow}>
              <Text style={[styles.section, { color: c.textPrimary }]}>Recent drills</Text>
              <Pressable onPress={() => router.push('/drills')}>
                <Text style={[styles.link, { color: c.textSecondary }]}>See all</Text>
              </Pressable>
            </View>
            {recent.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Sparkles size={32} color={c.textMuted} />}
                  title="No drills used yet"
                  body="Browse the library and start your first drill."
                  cta={
                    <Button
                      label="Browse drills"
                      variant="secondary"
                      onPress={() => router.push('/drills')}
                    />
                  }
                />
              </Card>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: SPACING.sm, paddingVertical: SPACING.xs }}
              >
                {recent.map((d) => (
                  <RecentDrillCard
                    key={d.id}
                    drill={d}
                    onPress={() => router.push(`/drill/${d.id}`)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      <ConnectionSheet visible={showConn} onClose={() => setShowConn(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  app: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  tag: { fontSize: 13, marginTop: 2 },
  heroLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { fontSize: 26, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontSize: 13, fontWeight: '600' },
  activeBanner: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.sm + 2,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FF6B3D',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  activeText: { color: '#fff', fontWeight: '800' },
});
