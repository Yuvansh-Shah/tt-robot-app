import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Copy, Pencil, Play, Trash2 } from 'lucide-react-native';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GlassBar } from '@/components/common/GlassBar';
import { useDrillStore } from '@/stores/drillStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { robot } from '@/services/robot';
import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING } from '@/constants/theme';
import { paramSummary, placementSummary, SPIN_LABELS } from '@/utils/format';

export default function DrillDetail() {
  const { c } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const drill = useDrillStore((s) => s.drills.find((d) => d.id === id));
  const duplicate = useDrillStore((s) => s.duplicateDrill);
  const remove = useDrillStore((s) => s.deleteDrill);
  const markUsed = useDrillStore((s) => s.markUsed);
  const startSession = useSessionStore((s) => s.startSession);
  const defaults = useSettingsStore((s) => s.defaults);

  if (!drill) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={c.textPrimary} />
        </Pressable>
        <View style={{ padding: SPACING.lg }}>
          <Text style={{ color: c.textPrimary, fontSize: 18 }}>Drill not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [isStarting, setIsStarting] = useState(false);

  const onStart = async () => {
    setIsStarting(true);
    try {
      markUsed(drill.id);
      startSession({ drill, fallbackParams: defaults });
      await robot.runDrill(drill);
    } catch (e) {
      console.log('robot.runDrill failed', e);
    } finally {
      setIsStarting(false);
    }
    router.push('/session/active');
  };

  const onDelete = () => {
    Alert.alert(
      `Delete "${drill.name}"?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(drill.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={c.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, gap: SPACING.md, paddingBottom: 140 }}>
        <View style={styles.titleBlock}>
          <View style={[styles.colorChip, { backgroundColor: drill.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.category, { color: c.textMuted }]}>
              {drill.category.toUpperCase()} · {drill.isPreset ? 'PRESET' : 'CUSTOM'}
            </Text>
            <Text style={[styles.name, { color: c.textPrimary }]}>{drill.name}</Text>
            {drill.description ? (
              <Text style={[styles.desc, { color: c.textSecondary }]}>
                {drill.description}
              </Text>
            ) : null}
          </View>
        </View>

        {drill.type === 'static' && drill.params ? (
          <Card>
            <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
              Parameters
            </Text>
            <Row label="Speed" value={`${drill.params.speed}`} />
            <Row label="Spin" value={`${SPIN_LABELS[drill.params.spinType]} · ${drill.params.spinIntensity}`} />
            <Row label="Frequency" value={`${drill.params.frequency} bpm`} />
            <Row label="Trajectory" value={`${drill.params.trajectory}`} />
            <Row label="Placement" value={placementSummary(drill.params.placement)} />
            {drill.params.placement.length > 1 ? (
              <Row label="Oscillation" value={drill.params.oscillation} />
            ) : null}
          </Card>
        ) : null}

        {drill.type === 'sequence' && drill.shots ? (
          <Card>
            <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
              Shot sequence
            </Text>
            {drill.shots.map((shot, i) => (
              <View
                key={shot.id}
                style={[styles.shot, { borderTopColor: c.border, borderTopWidth: i === 0 ? 0 : 1 }]}
              >
                <View style={[styles.shotIdx, { backgroundColor: drill.color }]}>
                  <Text style={styles.shotIdxText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shotPrim, { color: c.textPrimary }]}>
                    {paramSummary(shot.params)}
                  </Text>
                  <Text style={[styles.shotSec, { color: c.textMuted }]}>
                    {shot.ballCount
                      ? `${shot.ballCount} balls`
                      : shot.duration
                        ? `${shot.duration}s`
                        : '1 ball'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      <GlassBar>
        <View style={styles.actionBar}>
           <Button
             label="Start session"
             leftIcon={<Play size={18} color="#fff" />}
             loading={isStarting}
             fullWidth
             onPress={onStart}
             style={{ flex: 1 }}
           />
          <Button
            label=""
            variant="secondary"
            leftIcon={<Copy size={18} color={c.textPrimary} />}
            onPress={() => {
              const copy = duplicate(drill.id);
              if (copy) router.replace(`/drill/${copy.id}`);
            }}
          />
          {!drill.isPreset ? (
            <>
              <Button
                label=""
                variant="secondary"
                leftIcon={<Pencil size={18} color={c.textPrimary} />}
                onPress={() =>
                  router.push({ pathname: '/drill/new', params: { editId: drill.id } })
                }
              />
              <Button
                label=""
                variant="destructive"
                leftIcon={<Trash2 size={18} color="#fff" />}
                onPress={onDelete}
              />
            </>
          ) : null}
        </View>
      </GlassBar>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { c } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowVal, { color: c.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { padding: SPACING.md },
  topBar: { paddingHorizontal: SPACING.xs, paddingTop: SPACING.xs },
  iconBtn: { padding: SPACING.xs },
  titleBlock: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  colorChip: {
    width: 6,
    alignSelf: 'stretch',
    borderRadius: 3,
    minHeight: 56,
  },
  category: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  name: { fontSize: 26, fontWeight: '700', marginTop: 4 },
  desc: { fontSize: 14, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 14 },
  rowVal: { fontSize: 14, fontWeight: '600' },
  shot: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  shotIdx: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shotIdxText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  shotPrim: { fontSize: 14, fontWeight: '600' },
  shotSec: { fontSize: 12, marginTop: 2 },
  actionBar: {
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
});
