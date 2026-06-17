import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { SpinType } from '@/types/robot';
import { SPIN_GLYPH, SPIN_LABELS } from '@/utils/format';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

const ORDER: SpinType[] = ['topspin', 'backspin', 'left_sidespin', 'right_sidespin', 'none'];

interface Props {
  value: SpinType;
  onChange: (v: SpinType) => void;
}

export function SpinSelector({ value, onChange }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  return (
    <View style={styles.row}>
      {ORDER.map((s) => {
        const active = value === s;
        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            style={[
              styles.btn,
              {
                borderColor: active ? 'rgba(255,255,255,0.20)' : c.borderStrong,
                overflow: 'hidden',
              },
            ]}
          >
            {active ? (
              <LinearGradient
                colors={[COLORS.brandLight, COLORS.brand, COLORS.brandDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.45)',
                  },
                ]}
              />
            )}
            <Text style={[styles.glyph, { color: active ? '#fff' : c.textPrimary }]}>
              {SPIN_GLYPH[s]}
            </Text>
            <Text
              style={[styles.label, { color: active ? '#fff' : c.textSecondary }]}
            >
              {SPIN_LABELS[s]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.xs },
  btn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 2,
  },
  glyph: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '600' },
});
