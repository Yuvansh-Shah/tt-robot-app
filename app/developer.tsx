import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Slider } from '@/components/common/Slider';

import { robot, robotDebug } from '@/services/robot';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';

export default function Developer() {
  const { c } = useTheme();
  const router = useRouter();
  const jitter = useSettingsStore((s) => s.mockCadenceJitter);
  const setJitter = useSettingsStore((s) => s.setMockCadenceJitter);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={c.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: c.textPrimary }]}>Developer</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: SPACING.md, gap: SPACING.md }}>
        <Card>
          <Text style={[styles.sec, { color: c.textSecondary }]}>Mock connection</Text>
          <View style={{ gap: SPACING.xs, marginTop: SPACING.sm }}>
            <Button label="Force disconnect" variant="secondary" onPress={() => robotDebug.forceDisconnect()} />
            <Button label="Force error" variant="destructive" onPress={() => robotDebug.forceError()} />
            <Button label="Connect" onPress={() => robot.connect()} />
          </View>
        </Card>

        <Card>
          <Slider
            label="Mock cadence jitter"
            value={jitter}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => {
              setJitter(v);
              robotDebug.setCadenceJitter(v);
            }}
            formatValue={(v) => `±${Math.round(v * 100)}%`}
            helper="Adds random variation to the simulated ball cadence."
          />
        </Card>

        <Card>
          <Text style={[styles.sec, { color: c.textSecondary }]}>Robot controls</Text>
          <View style={{ gap: SPACING.xs, marginTop: SPACING.sm }}>
            <Button
              label="Start"
              variant="secondary"
              onPress={() =>
                robot.start({
                  speed: 5,
                  spinType: 'topspin',
                  spinIntensity: 5,
                  placement: ['mid_mid'],
                  oscillation: 'sequential',
                  trajectory: 5,
                  frequency: 60,
                })
              }
            />
            <Button label="Pause" variant="secondary" onPress={() => robot.pause()} />
            <Button label="Resume" variant="secondary" onPress={() => robot.resume()} />
            <Button label="Stop" variant="destructive" onPress={() => robot.stop()} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.xs,
    gap: SPACING.xs,
  },
  iconBtn: { padding: SPACING.xs },
  title: { fontSize: 18, fontWeight: '700' },
  sec: { fontSize: 13, fontWeight: '600' },
});
