import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BallParameters } from '@/types/robot';
import { isCustomPlacement } from '@/types/robot';
import { Slider } from '@/components/common/Slider';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { SpinSelector } from './SpinSelector';
import { PlacementGrid } from './PlacementGrid';
import { Card } from '@/components/common/Card';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';
import { bpmToInterval } from '@/utils/time';
import { useSettingsStore } from '@/stores/settingsStore';
import { speedDisplay } from '@/utils/format';

interface Props {
  value: BallParameters;
  onChange: (patch: Partial<BallParameters>) => void;
  showBallCountTarget?: boolean;
}

export function ControlSurface({ value, onChange, showBallCountTarget = true }: Props) {
  const { c } = useTheme();
  const haptics = useHaptics();
  const units = useSettingsStore((s) => s.units);
  const [placementMode, setPlacementMode] = useState<'zone' | 'custom'>(
    value.placement.some(isCustomPlacement) ? 'custom' : 'zone',
  );

  const handle = (patch: Partial<BallParameters>) => {
    haptics.selection();
    onChange(patch);
  };

  const multiZone =
    value.placement.length > 1 && !value.placement.some(isCustomPlacement);

  return (
    <View style={{ gap: SPACING.md }}>
      <Card>
        <Slider
          label="Speed"
          value={value.speed}
          min={1}
          max={10}
          onChange={(v) => handle({ speed: v })}
          formatValue={(v) => speedDisplay(v, units)}
        />
      </Card>

      <Card>
        <Text style={[styles.heading, { color: c.textSecondary }]}>Spin</Text>
        <SpinSelector
          value={value.spinType}
          onChange={(v) => handle({ spinType: v })}
        />
        <View style={{ marginTop: SPACING.md }}>
          <Slider
            label="Spin intensity"
            value={value.spinIntensity}
            min={0}
            max={10}
            onChange={(v) => handle({ spinIntensity: v })}
            formatValue={(v) => `${v}`}
            disabled={value.spinType === 'none'}
          />
        </View>
      </Card>

      <Card>
        <Slider
          label="Frequency"
          value={value.frequency}
          min={15}
          max={90}
          onChange={(v) => handle({ frequency: v })}
          formatValue={(v) => `${v} bpm`}
          helper={bpmToInterval(value.frequency)}
        />
      </Card>

      <Card>
        <Slider
          label="Trajectory"
          value={value.trajectory}
          min={1}
          max={10}
          onChange={(v) => handle({ trajectory: v })}
          formatValue={(v) => (v <= 3 ? `${v} · low` : v >= 8 ? `${v} · high` : `${v}`)}
          helper="Low drive → high lob"
        />
      </Card>

      <Card>
        <PlacementGrid
          mode={placementMode}
          onModeChange={setPlacementMode}
          value={value.placement}
          onChange={(v) => handle({ placement: v })}
        />
        {multiZone ? (
          <View style={{ marginTop: SPACING.sm }}>
            <Text style={[styles.heading, { color: c.textSecondary }]}>Oscillation</Text>
            <SegmentedControl<'sequential' | 'random'>
              segments={[
                { value: 'sequential', label: 'Sequential' },
                { value: 'random', label: 'Random' },
              ]}
              value={value.oscillation}
              onChange={(v) => handle({ oscillation: v })}
            />
          </View>
        ) : null}
      </Card>

      {showBallCountTarget ? (
        <Card>
          <Text style={[styles.heading, { color: c.textSecondary }]}>Ball target</Text>
          <SegmentedControl<'open' | '25' | '50' | '100'>
            segments={[
              { value: 'open', label: 'Open' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
            ]}
            value={
              value.ballCountTarget === 25
                ? '25'
                : value.ballCountTarget === 50
                  ? '50'
                  : value.ballCountTarget === 100
                    ? '100'
                    : 'open'
            }
            onChange={(v) => handle({
              ballCountTarget: v === 'open' ? undefined : Number(v),
            })}
          />
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 13, marginBottom: SPACING.xs },
});
