import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS } from '@/constants/theme';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: Props<T>) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(255,255,255,0.45)',
          borderColor: c.border,
        },
      ]}
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            onPress={() => onChange(s.value)}
            style={[styles.seg, { overflow: 'hidden' }]}
          >
            {active ? (
              <LinearGradient
                colors={[COLORS.brandLight, COLORS.brand]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Text
              style={{
                color: active ? '#fff' : c.textSecondary,
                fontWeight: active ? '700' : '500',
                fontSize: 14,
              }}
            >
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: RADIUS.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  seg: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
