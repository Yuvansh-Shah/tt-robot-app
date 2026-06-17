import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { COLORS } from '@/constants/theme';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export function Switch({ value, onChange, disabled }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: value
            ? 'transparent'
            : isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(15,15,30,0.10)',
          borderColor: value ? 'rgba(255,255,255,0.18)' : c.border,
          opacity: disabled ? 0.5 : 1,
          overflow: 'hidden',
        },
      ]}
    >
      {value ? (
        <LinearGradient
          colors={[COLORS.brandLight, COLORS.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={[
          styles.knob,
          { transform: [{ translateX: value ? 22 : 2 }] },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
