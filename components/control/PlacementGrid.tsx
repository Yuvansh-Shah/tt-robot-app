import React, { useCallback, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import type { PlacementZone, PlacementZoneName } from '@/types/robot';
import { isCustomPlacement } from '@/types/robot';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

const ZONE_GRID: PlacementZoneName[][] = [
  ['far_left', 'far_mid', 'far_right'],
  ['mid_left', 'mid_mid', 'mid_right'],
  ['wide_left', 'wide_mid', 'wide_right'],
];

interface Props {
  mode: 'zone' | 'custom';
  onModeChange: (m: 'zone' | 'custom') => void;
  value: PlacementZone[];
  onChange: (v: PlacementZone[]) => void;
}

export function PlacementGrid({ mode, onModeChange, value, onChange }: Props) {
  const { c } = useTheme();
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const custom = value.find(isCustomPlacement);

  const selectedZones = new Set(
    value.filter((v): v is PlacementZoneName => typeof v === 'string'),
  );

  const toggleZone = (z: PlacementZoneName) => {
    const has = selectedZones.has(z);
    const newZones = value
      .filter((v) => typeof v === 'string' && v !== z) as PlacementZone[];
    if (!has) newZones.push(z);
    if (newZones.length === 0) newZones.push(z);
    onChange(newZones);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    heightRef.current = e.nativeEvent.layout.height;
    setLayout({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  };

  const handleCustom = useCallback((x: number, y: number) => {
    const w = widthRef.current || 1;
    const h = heightRef.current || 1;
    const nx = Math.max(0, Math.min(1, x / w));
    const ny = Math.max(0, Math.min(1, y / h));
    onChange([{ custom: { x: nx, y: ny } }]);
  }, [onChange]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'custom',
      onMoveShouldSetPanResponder: () => mode === 'custom',
      onPanResponderGrant: (e) => handleCustom(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) => handleCustom(e.nativeEvent.locationX, e.nativeEvent.locationY),
    }),
  ).current;

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: c.textSecondary }]}>Placement</Text>
        <View style={[styles.modeToggle, { backgroundColor: c.surface2 }]}>
          {(['zone', 'custom'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => onModeChange(m)}
              style={[
                styles.modeBtn,
                mode === m && { backgroundColor: c.surface },
              ]}
            >
              <Text
                style={{
                  color: mode === m ? c.textPrimary : c.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {m === 'zone' ? 'Zones' : 'Precise'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        onLayout={onLayout}
        {...responder.panHandlers}
        style={[styles.table, { borderColor: 'rgba(255,255,255,0.18)' }]}
      >
        <View style={styles.net} />
        {mode === 'zone'
          ? ZONE_GRID.map((row, ri) => (
              <View key={ri} style={styles.zoneRow}>
                {row.map((z) => {
                  const active = selectedZones.has(z);
                  return (
                    <Pressable
                      key={z}
                      onPress={() => toggleZone(z)}
                      style={[
                        styles.zone,
                        {
                          backgroundColor: active
                            ? 'rgba(233,75,60,0.85)'
                            : 'rgba(255,255,255,0.06)',
                          borderColor: active ? COLORS.brand : 'rgba(255,255,255,0.18)',
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))
          : custom && layout.w > 0
            ? (
              <View
                pointerEvents="none"
                style={[
                  styles.marker,
                  {
                    left: custom.custom.x * layout.w - 12,
                    top: custom.custom.y * layout.h - 12,
                  },
                ]}
              />
            )
            : null}
      </View>

      {mode === 'zone' && selectedZones.size === 0 ? (
        <Text style={[styles.hint, { color: c.textMuted }]}>
          Tap a zone to select. Tap multiple zones to oscillate between them.
        </Text>
      ) : mode === 'custom' ? (
        <Text style={[styles.hint, { color: c.textMuted }]}>
          Tap anywhere on the table to set exact placement.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: { fontSize: 13 },
  modeToggle: { flexDirection: 'row', padding: 2, borderRadius: RADIUS.sm },
  modeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm - 2,
  },
  table: {
    aspectRatio: 1.6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 6,
    gap: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 80, 50, 0.55)',
  },
  net: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
  zoneRow: { flexDirection: 'row', flex: 1, gap: 6 },
  zone: {
    flex: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.brand,
    borderWidth: 2,
    borderColor: '#fff',
  },
  hint: { fontSize: 12, marginTop: SPACING.xs },
});
