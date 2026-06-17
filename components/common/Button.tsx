import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  fullWidth,
}: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';
  const padV = size === 'sm' ? SPACING.xs : size === 'md' ? SPACING.sm : SPACING.md - 2;
  const padH = size === 'sm' ? SPACING.sm : SPACING.md;
  const fontSize = size === 'sm' ? 14 : size === 'md' ? 16 : 17;

  const fg =
    variant === 'primary' || variant === 'destructive' ? '#fff' : c.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          borderRadius: RADIUS.pill,
          overflow: 'hidden',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: borderFor(variant, c.borderStrong),
        },
        // soft outer glow on primary action — mimics the warm bloom in the spec
        variant === 'primary' && !disabled
          ? {
              shadowColor: COLORS.brand,
              shadowOpacity: 0.55,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 18,
              elevation: 8,
            }
          : null,
        style,
      ]}
    >
      {/* Fill layer */}
      {variant === 'primary' ? (
        <LinearGradient
          colors={[COLORS.brandLight, COLORS.brand, COLORS.brandDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : variant === 'destructive' ? (
        <LinearGradient
          colors={['#FF7878', '#FF5C5C', '#D04040']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : variant === 'secondary' ? (
        <>
          <BlurView
            tint={c.glassTint}
            intensity={isDark ? 40 : 60}
            blurMethod={
              Platform.OS === 'android' ? 'dimezisBlurView' : undefined
            }
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={
              isDark
                ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']
                : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}

      <View
        style={{
          paddingVertical: padV,
          paddingHorizontal: padH,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: SPACING.xs,
        }}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {leftIcon ? <View>{leftIcon}</View> : null}
            {label ? (
              <Text style={[styles.label, { color: fg, fontSize }]}>{label}</Text>
            ) : null}
            {rightIcon ? <View>{rightIcon}</View> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

function borderFor(v: ButtonVariant, glass: string): string {
  if (v === 'primary') return 'rgba(255,255,255,0.18)';
  if (v === 'destructive') return 'rgba(255,255,255,0.18)';
  return glass;
}

const styles = StyleSheet.create({
  label: { fontWeight: '600' },
});
