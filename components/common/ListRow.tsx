import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING } from '@/constants/theme';

interface Props {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
}

export function ListRow({
  label,
  value,
  onPress,
  right,
  destructive,
  showChevron = true,
}: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed
            ? isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.04)'
            : 'transparent',
          borderBottomColor: c.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: destructive ? '#FF5C5C' : c.textPrimary },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rightWrap}>
        {value ? (
          <Text style={[styles.value, { color: c.textSecondary }]}>{value}</Text>
        ) : null}
        {right}
        {onPress && showChevron && !right ? (
          <ChevronRight size={18} color={c.textMuted} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 16, flex: 1 },
  value: { fontSize: 15 },
  rightWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
});
