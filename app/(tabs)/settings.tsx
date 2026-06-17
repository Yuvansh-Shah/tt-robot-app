import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { ListRow } from '@/components/common/ListRow';
import { Switch } from '@/components/common/Switch';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Button } from '@/components/common/Button';
import { Sheet } from '@/components/common/Sheet';
import { ControlSurface } from '@/components/control/ControlSurface';

import { useSettingsStore } from '@/stores/settingsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useDrillStore } from '@/stores/drillStore';
import { robot } from '@/services/robot';
import type { ConnectionState } from '@/types/robot';

import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';

export default function SettingsScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const settings = useSettingsStore();
  const [showDefaults, setShowDefaults] = useState(false);
  const [draft, setDraft] = useState(settings.defaults);
  const [connState, setConnState] = useState<ConnectionState>(robot.getConnectionState());

  useEffect(() => {
    return robot.onConnectionStateChange(setConnState);
  }, []);

  const resetAll = () => {
    Alert.alert(
      'Reset all data?',
      'This will delete all sessions, custom drills, and reset settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Really reset?',
              'Last chance. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, reset',
                  style: 'destructive',
                  onPress: () => {
                    settings.resetAll();
                    useHistoryStore.getState().reset();
                    useDrillStore.setState({ drills: [], hasSeeded: false });
                    useDrillStore.getState().seedIfNeeded();
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <Section title="Robot">
          <Card padded={false}>
            <ListRow
              label="Status"
              value={statusLabel(connState)}
              showChevron={false}
            />
            <ListRow
              label="Paired robot"
              value="Robot-A1B2 (mock)"
              showChevron={false}
            />
            <ListRow
              label="Forget robot"
              destructive
              onPress={() => {
                robot.disconnect();
                Alert.alert('Robot forgotten', 'You will need to pair again next time.');
              }}
              showChevron={false}
            />
          </Card>
        </Section>

        <Section title="Defaults">
          <Card padded={false}>
            <ListRow
              label="Quick-start parameters"
              onPress={() => {
                setDraft(settings.defaults);
                setShowDefaults(true);
              }}
            />
          </Card>
        </Section>

        <Section title="Display">
          <Card padded>
            <Text style={[styles.label, { color: c.textSecondary }]}>Theme</Text>
            <SegmentedControl<'system' | 'light' | 'dark'>
              segments={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              value={settings.theme}
              onChange={settings.setTheme}
            />
            <View style={{ height: SPACING.md }} />
            <Text style={[styles.label, { color: c.textSecondary }]}>Speed units</Text>
            <SegmentedControl<'scale' | 'metric'>
              segments={[
                { value: 'scale', label: '1–10' },
                { value: 'metric', label: 'm/s' },
              ]}
              value={settings.units}
              onChange={settings.setUnits}
            />
          </Card>
        </Section>

        <Section title="Feedback">
          <Card padded={false}>
            <ListRow
              label="Haptics"
              right={
                <Switch
                  value={settings.haptics}
                  onChange={settings.setHaptics}
                />
              }
              showChevron={false}
            />
          </Card>
        </Section>

        <Section title="About">
          <Card padded={false}>
            <ListRow label="Version" value="1.0.0 (Phase 1)" showChevron={false} />
            <ListRow label="Build" value="mock-001" showChevron={false} />
            <ListRow
              label="Developer / Mock controls"
              onPress={() => router.push('/developer')}
            />
            <ListRow label="Reset all data" destructive onPress={resetAll} showChevron={false} />
          </Card>
        </Section>
      </ScrollView>

      <Sheet
        visible={showDefaults}
        onClose={() => setShowDefaults(false)}
        title="Default parameters"
      >
        <ScrollView style={{ maxHeight: 540 }}>
          <ControlSurface
            value={draft}
            onChange={(p) => setDraft({ ...draft, ...p })}
            showBallCountTarget={false}
          />
        </ScrollView>
        <View style={{ marginTop: SPACING.md }}>
          <Button
            label="Save defaults"
            fullWidth
            onPress={() => {
              settings.setDefaults(draft);
              setShowDefaults(false);
            }}
          />
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingHorizontal: SPACING.md, marginTop: SPACING.lg }}>
      <Text style={[styles.section, { color: c.textMuted }]}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function statusLabel(s: ConnectionState): string {
  switch (s) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting…';
    case 'error': return 'Error';
    default: return 'Disconnected';
  }
}

const styles = StyleSheet.create({
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: SPACING.xs },
  label: { fontSize: 13, marginBottom: SPACING.xs },
});
