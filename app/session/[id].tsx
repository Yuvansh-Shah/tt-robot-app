import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Trash2 } from 'lucide-react-native';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GlassBar } from '@/components/common/GlassBar';
import { useHistoryStore } from '@/stores/historyStore';
import { useDrillStore } from '@/stores/drillStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { robot } from '@/services/robot';

import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING } from '@/constants/theme';
import { formatHhMm, formatMmSs, relativeDay } from '@/utils/time';
import { paramSummary, placementSummary, SPIN_LABELS } from '@/utils/format';

export default function SessionDetail() {
  const { c } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const session = useHistoryStore((s) => s.sessions.find((x) => x.id === id));
  const deleteSession = useHistoryStore((s) => s.deleteSession);
  const drills = useDrillStore((s) => s.drills);
  const startSession = useSessionStore((s) => s.startSession);
  const defaults = useSettingsStore((s) => s.defaults);

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={c.textPrimary} />
        </Pressable>
        <View style={{ padding: SPACING.lg }}>
          <Text style={{ color: c.textPrimary }}>Session not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const start = new Date(session.startedAt);
  const end = new Date(session.endedAt);

  const onRepeat = async () => {
    const firstSeg = session.segments[0];
    const drill = firstSeg?.drillId ? drills.find((d) => d.id === firstSeg.drillId) : undefined;
    startSession({ drill, fallbackParams: firstSeg?.paramsSnapshot ?? defaults });
    try {
      if (drill) await robot.runDrill(drill);
      else await robot.start(firstSeg?.paramsSnapshot ?? defaults);
    } catch {}
    router.push('/session/active');
  };

  const onDelete = () =>
    Alert.alert('Delete session?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSession(session.id);
          router.back();
        },
      },
    ]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={c.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, gap: SPACING.md, paddingBottom: 140 }}>
        <View>
          <Text style={[styles.day, { color: c.textPrimary }]}>
            {relativeDay(session.startedAt)}
          </Text>
          <Text style={[styles.range, { color: c.textSecondary }]}>
            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <Card style={{ flex: 1 }}>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>DURATION</Text>
            <Text style={[styles.statValue, { color: c.textPrimary }]}>
              {formatHhMm(session.durationMs) === '0m' ? formatMmSs(session.durationMs) : formatHhMm(session.durationMs)}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>BALLS</Text>
            <Text style={[styles.statValue, { color: c.textPrimary }]}>
              {session.totalBalls}
            </Text>
          </Card>
        </View>

        <Card>
          <Text style={[styles.heading, { color: c.textSecondary }]}>Segments</Text>
          {session.segments.map((seg, i) => (
            <View
              key={i}
              style={[styles.seg, { borderTopColor: c.border, borderTopWidth: i === 0 ? 0 : 1 }]}
            >
              <View style={[styles.segBar, { backgroundColor: seg.drillColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.segName, { color: c.textPrimary }]}>{seg.drillName}</Text>
                <Text style={[styles.segMeta, { color: c.textSecondary }]}>
                  {paramSummary(seg.paramsSnapshot)}
                </Text>
                <Text style={[styles.segMeta2, { color: c.textMuted }]}>
                  {formatMmSs(seg.endedAt - seg.startedAt)} · {seg.ballCount} balls · {placementSummary(seg.paramsSnapshot.placement)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {session.note ? (
          <Card>
            <Text style={[styles.heading, { color: c.textSecondary }]}>Note</Text>
            <Text style={{ color: c.textPrimary, fontSize: 15, lineHeight: 22 }}>
              {session.note}
            </Text>
          </Card>
        ) : null}
      </ScrollView>

      <GlassBar>
        <View style={styles.actionBar}>
          <Button
            label="Repeat session"
            fullWidth
            leftIcon={<Play size={18} color="#fff" />}
            onPress={onRepeat}
            style={{ flex: 1 }}
          />
          <Button
            label=""
            variant="destructive"
            leftIcon={<Trash2 size={18} color="#fff" />}
            onPress={onDelete}
          />
        </View>
      </GlassBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: SPACING.xs, paddingTop: SPACING.xs },
  iconBtn: { padding: SPACING.xs },
  day: { fontSize: 28, fontWeight: '700' },
  range: { fontSize: 14, marginTop: 2 },
  statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  statValue: { fontSize: 26, fontWeight: '700', marginTop: 4 },
  heading: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm },
  seg: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.sm },
  segBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  segName: { fontSize: 15, fontWeight: '600' },
  segMeta: { fontSize: 13, marginTop: 2 },
  segMeta2: { fontSize: 12, marginTop: 2 },
  actionBar: {
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
});
