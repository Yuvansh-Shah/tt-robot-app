import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pause, Play, RefreshCw, Square, X } from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/common/Button';
import { Sheet } from '@/components/common/Sheet';
import { GlassBar } from '@/components/common/GlassBar';
import { AppBackground } from '@/components/common/AppBackground';
import { ControlSurface } from '@/components/control/ControlSurface';

import { useSessionStore } from '@/stores/sessionStore';
import { useDrillStore } from '@/stores/drillStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { robot } from '@/services/robot';

import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { formatMmSs } from '@/utils/time';

function TimerDisplay({
  startedAt,
  pausedAccumMs,
  isPaused,
  pauseStartedAt,
}: {
  startedAt: number;
  pausedAccumMs: number;
  isPaused: boolean;
  pauseStartedAt: number | null;
}) {
  const [now, setNow] = useState(Date.now());
  const { c } = useTheme();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const elapsed = Math.max(
    0,
    now - startedAt - pausedAccumMs - (isPaused && pauseStartedAt ? now - pauseStartedAt : 0),
  );

  return (
    <Text style={[styles.metric, { color: c.textSecondary }]}>
      {formatMmSs(elapsed)}
    </Text>
  );
}

export default function ActiveSessionScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;

  const isActive = useSessionStore((s) => s.isActive);
  const isPaused = useSessionStore((s) => s.isPaused);
  const startedAt = useSessionStore((s) => s.startedAt);
  const pausedAccumMs = useSessionStore((s) => s.pausedAccumMs);
  const pauseStartedAt = useSessionStore((s) => s.pauseStartedAt);
  const current = useSessionStore((s) => s.current);
  const pause = useSessionStore((s) => s.pause);
  const resume = useSessionStore((s) => s.resume);
  const switchDrill = useSessionStore((s) => s.switchDrill);
  const updateParams = useSessionStore((s) => s.updateParams);
  const incrementBallCount = useSessionStore((s) => s.incrementBallCount);
  const endSession = useSessionStore((s) => s.endSession);
  const setNote = useSessionStore((s) => s.setNote);
  const note = useSessionStore((s) => s.note);

  const drills = useDrillStore((s) => s.drills);
  const markUsed = useDrillStore((s) => s.markUsed);
  const addSession = useHistoryStore((s) => s.addSession);
  const defaults = useSettingsStore((s) => s.defaults);

  const [elapsedAtEnd, setElapsedAtEnd] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [practiceShown, setPracticeShown] = useState(false);
  const targetReachedRef = useRef(false);
  const onEndRef = useRef<() => void>(() => {});

  // Wire ball-thrown ticks
  useEffect(() => {
    const off = robot.onBallThrown(() => {
      useSessionStore.getState().incrementBallCount();
      hapticsRef.current.light();
    });
    return off;
  }, []);

  // Update params when the user changes a slider
  useEffect(() => {
    if (current && robot.isRunning()) {
      robot.updateParameters(current.params).catch(() => {});
    }
  }, [current?.params]);

  // App background -> auto pause
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      const { isActive, isPaused } = useSessionStore.getState();
      if (st !== 'active' && isActive && !isPaused) {
        useSessionStore.getState().pause();
        robot.pause().catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  // If the user starts without a connected robot, surface a one-time practice prompt.
  useEffect(() => {
    if (!isActive || practiceShown) return;
    const state = robot.getConnectionState();
    if (state === 'connected') return;
    setPracticeShown(true);
    Alert.alert(
      'Robot not connected',
      'Connect now, or run in practice mode? Practice mode keeps the timer and ball counter going so you can rehearse the drill UX.',
      [
        { text: 'Practice', style: 'default' },
        { text: 'Connect', onPress: () => robot.connect().catch(() => {}) },
      ],
    );
  }, [isActive, practiceShown]);

  // Ball-count target watcher
  useEffect(() => {
    if (!current) return;
    const target = current.params.ballCountTarget;
    if (target && current.ballCount >= target && !targetReachedRef.current) {
      targetReachedRef.current = true;
      hapticsRef.current.success();
      robot.pause().catch(() => {});
      useSessionStore.getState().pause();
      Alert.alert('Target reached', `${target} balls thrown.`, [
        {
          text: 'Continue',
          onPress: () => {
            targetReachedRef.current = false;
            useSessionStore.getState().resume();
            robot.resume().catch(() => {});
          },
        },
        {
          text: 'End session',
          style: 'destructive',
          onPress: () => onEndRef.current(),
        },
      ]);
    }
  }, [current?.ballCount, current?.params.ballCountTarget]);

  if (!isActive || !current || !startedAt) {
    return (
      <AppBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: SPACING.lg, gap: SPACING.md }}>
            <Text style={{ color: c.textPrimary, fontSize: 18 }}>
              No active session.
            </Text>
            <Button label="Close" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const onPauseResume = async () => {
    if (isPaused) {
      resume();
      try { await robot.resume(); } catch {}
    } else {
      pause();
      try { await robot.pause(); } catch {}
    }
    haptics.medium();
  };

  const onEnd = async () => {
    targetReachedRef.current = false;
    const s = useSessionStore.getState();
    const pauseNow = Date.now();
    const pausedDelta = s.isPaused && s.pauseStartedAt ? pauseNow - s.pauseStartedAt : 0;
    setElapsedAtEnd(Math.max(0, pauseNow - (s.startedAt ?? pauseNow) - s.pausedAccumMs - pausedDelta));
    pause();
    try { await robot.stop(); } catch {}
    setShowSummary(true);
  };
  onEndRef.current = onEnd;

  const onConfirmSave = () => {
    const session = endSession();
    if (session) {
      addSession(session);
      session.segments.forEach((seg) => {
        if (seg.drillId) markUsed(seg.drillId);
      });
    }
    setShowSummary(false);
    router.dismissAll?.();
    router.replace('/');
  };

  const onDiscard = () => {
    Alert.alert('Discard session?', 'This session will not be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          useSessionStore.getState().cancel();
          setShowSummary(false);
          router.dismissAll?.();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <X size={22} color={c.textPrimary} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[styles.drillName, { color: c.textPrimary }]} numberOfLines={1}>
            {current.drillName}
          </Text>
          <View style={styles.metricsRow}>
            <TimerDisplay
              startedAt={startedAt}
              pausedAccumMs={pausedAccumMs}
              isPaused={isPaused}
              pauseStartedAt={pauseStartedAt}
            />
            <Text style={[styles.dot, { color: c.textMuted }]}>·</Text>
            <Text style={[styles.metric, { color: COLORS.brand, fontWeight: '700' }]}>
              {current.ballCount}{current.params.ballCountTarget ? ` / ${current.params.ballCountTarget}` : ''} balls
            </Text>
          </View>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {isPaused ? (
        <View style={[styles.pausedBanner, { backgroundColor: c.surface2 }]}>
          <Text style={{ color: c.textPrimary, fontWeight: '700' }}>Paused</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 160 }}>
        <ControlSurface
          value={current.params}
          onChange={(p) => updateParams(p)}
        />
      </ScrollView>

      <GlassBar>
        <View style={styles.actionBar}>
          <Pressable
            onPress={onPauseResume}
            style={[
              styles.actionBtn,
              {
                backgroundColor: c.surface,
                borderColor: c.borderStrong,
              },
            ]}
          >
            {isPaused ? (
              <Play size={20} color={c.textPrimary} />
            ) : (
              <Pause size={20} color={c.textPrimary} />
            )}
            <Text style={[styles.actionLabel, { color: c.textPrimary }]}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowSwitch(true)}
            style={[
              styles.actionBtn,
              {
                backgroundColor: c.surface,
                borderColor: c.borderStrong,
              },
            ]}
          >
            <RefreshCw size={20} color={c.textPrimary} />
            <Text style={[styles.actionLabel, { color: c.textPrimary }]}>Switch</Text>
          </Pressable>
          <Pressable onPress={onEnd} style={[styles.actionBtn, styles.endBtn]}>
            <LinearGradient
              colors={[COLORS.brandLight, COLORS.brand, COLORS.brandDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Square size={20} color="#fff" fill="#fff" />
            <Text style={[styles.actionLabel, { color: '#fff' }]}>End</Text>
          </Pressable>
        </View>
      </GlassBar>

      <Sheet
        visible={showSwitch}
        onClose={() => setShowSwitch(false)}
        title="Switch drill"
      >
        <FlatList
          data={drills}
          keyExtractor={(d) => d.id}
          style={{ maxHeight: 380 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                switchDrill(item);
                markUsed(item.id);
                robot.runDrill(item).catch(() => {});
                setShowSwitch(false);
              }}
              style={[
                styles.switchRow,
                { backgroundColor: c.surface2, borderColor: c.border },
              ]}
            >
              <View style={[styles.switchBar, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchName, { color: c.textPrimary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.switchCat, { color: c.textMuted }]}>
                  {item.category}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </Sheet>

      <SummarySheet
        visible={showSummary}
        elapsedMs={elapsedAtEnd}
        ballCount={current.ballCount}
        drillName={current.drillName}
        note={note}
        onNoteChange={setNote}
        onCancel={() => setShowSummary(false)}
        onSave={onConfirmSave}
        onDiscard={onDiscard}
      />
      </SafeAreaView>
    </AppBackground>
  );
}

function SummarySheet({
  visible,
  elapsedMs,
  ballCount,
  drillName,
  note,
  onNoteChange,
  onCancel,
  onSave,
  onDiscard,
}: {
  visible: boolean;
  elapsedMs: number;
  ballCount: number;
  drillName: string;
  note: string;
  onNoteChange: (s: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const { c } = useTheme();
  return (
    <Sheet visible={visible} onClose={onCancel} title="Session complete">
      <View style={{ gap: SPACING.md }}>
        <View style={[styles.summary, { backgroundColor: c.surface2 }]}>
          <Text style={[styles.summaryDrill, { color: c.textPrimary }]} numberOfLines={1}>
            {drillName}
          </Text>
          <View style={{ flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.sm }}>
            <View>
              <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '700' }}>DURATION</Text>
              <Text style={{ color: c.textPrimary, fontSize: 22, fontWeight: '700' }}>
                {formatMmSs(elapsedMs)}
              </Text>
            </View>
            <View>
              <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '700' }}>BALLS</Text>
              <Text style={{ color: c.textPrimary, fontSize: 22, fontWeight: '700' }}>
                {ballCount}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <Text style={{ color: c.textSecondary, fontSize: 13, marginBottom: SPACING.xs }}>
            Note (optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={onNoteChange}
            placeholder="How did it feel?"
            placeholderTextColor={c.textMuted}
            multiline
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: RADIUS.md,
              padding: SPACING.sm,
              color: c.textPrimary,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
          <Button label="Discard" variant="ghost" onPress={onDiscard} />
          <Button label="Save session" fullWidth onPress={onSave} style={{ flex: 1 }} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { padding: SPACING.xs, width: 32 },
  drillName: { fontSize: 17, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metric: { fontSize: 14 },
  dot: { fontSize: 14 },
  pausedBanner: {
    alignSelf: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  actionBar: {
    padding: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  endBtn: {
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: COLORS.brand,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  actionLabel: { fontSize: 12, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  switchBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  switchName: { fontSize: 15, fontWeight: '600' },
  switchCat: { fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  summary: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  summaryDrill: { fontSize: 16, fontWeight: '700' },
});
