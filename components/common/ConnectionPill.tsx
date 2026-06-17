import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { robot } from '@/services/robot';
import type { ConnectionState } from '@/types/robot';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface Props {
  onPress?: () => void;
}

export function ConnectionPill({ onPress }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  const [state, setState] = useState<ConnectionState>(robot.getConnectionState());

  useEffect(() => {
    return robot.onConnectionStateChange(setState);
  }, []);

  const config = pillConfigFor(state);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.wrap,
        {
          borderColor: c.borderStrong,
          overflow: 'hidden',
          shadowColor: config.color,
          shadowOpacity: state === 'connected' ? 0.35 : 0,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: state === 'connected' ? 4 : 0,
        },
      ]}
    >
      <BlurView
        tint={c.glassTint}
        intensity={isDark ? 40 : 70}
        blurMethod={
          Platform.OS === 'android' ? 'dimezisBlurView' : undefined
        }
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(255,255,255,0.4)',
          },
        ]}
      />
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: c.textPrimary }]}>{config.label}</Text>
    </Pressable>
  );
}

function pillConfigFor(s: ConnectionState) {
  switch (s) {
    case 'connected':
      return { color: COLORS.status.ok, label: 'Connected' };
    case 'connecting':
      return { color: COLORS.status.warn, label: 'Connecting…' };
    case 'error':
      return { color: COLORS.status.err, label: 'Error' };
    case 'disconnected':
    default:
      return { color: '#A8A5AE', label: 'Disconnected' };
  }
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
