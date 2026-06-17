import React, { useCallback, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onChangeEnd?: (v: number) => void;
  formatValue?: (v: number) => string;
  disabled?: boolean;
  helper?: string;
  tint?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onChangeEnd,
  formatValue,
  disabled,
  helper,
  tint,
}: SliderProps) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const accent = tint ?? COLORS.brand;
  const pct = max === min ? 0 : (value - min) / (max - min);

  const fromX = useCallback(
    (x: number) => {
      const w = widthRef.current || 1;
      let p = Math.max(0, Math.min(1, x / w));
      let v = min + p * (max - min);
      v = Math.round(v / step) * step;
      v = Math.max(min, Math.min(max, v));
      return v;
    },
    [min, max, step],
  );

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (e) => {
        const v = fromX(e.nativeEvent.locationX);
        if (v !== valueRef.current) onChange(v);
      },
      onPanResponderMove: (e) => {
        const v = fromX(e.nativeEvent.locationX);
        if (v !== valueRef.current) onChange(v);
      },
      onPanResponderRelease: (e) => {
        const v = fromX(e.nativeEvent.locationX);
        onChange(v);
        onChangeEnd?.(v);
      },
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={{ opacity: disabled ? 0.45 : 1 }}>
      {label || formatValue ? (
        <View style={styles.row}>
          {label ? (
            <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
          ) : (
            <View />
          )}
          {formatValue ? (
            <Text style={[styles.value, { color: c.textPrimary }]}>
              {formatValue(value)}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        {...responder.panHandlers}
        onLayout={onLayout}
        style={[
          styles.track,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(15,15,30,0.08)',
            borderColor: c.border,
            overflow: 'hidden',
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.brandLight, accent, COLORS.brandDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct * 100}%` }]}
        />
        {width > 0 ? (
          <View
            style={[
              styles.thumb,
              {
                left: Math.max(0, Math.min(width - 24, pct * width - 12)),
                backgroundColor: '#fff',
                borderColor: accent,
                shadowColor: accent,
              },
            ]}
          />
        ) : null}
      </View>
      {helper ? (
        <Text style={[styles.helper, { color: c.textMuted }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: { fontSize: 13, fontWeight: '500' },
  value: { fontSize: 15, fontWeight: '700' },
  track: {
    height: 28,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: RADIUS.pill,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  helper: { fontSize: 12, marginTop: SPACING.xxs },
});
