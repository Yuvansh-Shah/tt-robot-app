import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';

interface Props {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  cta?: React.ReactNode;
}

export function EmptyState({ icon, title, body, cta }: Props) {
  const { c } = useTheme();
  return (
    <View style={styles.wrap}>
      {icon ? <View style={{ marginBottom: SPACING.md }}>{icon}</View> : null}
      <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      {body ? (
        <Text style={[styles.body, { color: c.textSecondary }]}>{body}</Text>
      ) : null}
      {cta ? <View style={{ marginTop: SPACING.md }}>{cta}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: 14, textAlign: 'center', marginTop: SPACING.xs },
});
