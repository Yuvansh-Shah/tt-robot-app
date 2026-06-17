import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  hint?: string;
  tint?: string;
}

export function StatTile({ label, value, hint, tint }: Props) {
  const { c } = useTheme();
  return (
    <Card style={{ flex: 1 }} variant="flat">
      <Text style={[styles.label, { color: c.textSecondary }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, { color: tint ?? c.textPrimary }]}>
        {value}
      </Text>
      {hint ? (
        <Text style={[styles.hint, { color: c.textMuted }]}>{hint}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  value: { fontSize: 28, fontWeight: '800', marginTop: 6 },
  hint: { fontSize: 12, marginTop: SPACING.xxs },
});
