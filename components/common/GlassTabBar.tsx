import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { mode, c } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = mode === 'dark';

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outer,
        { paddingBottom: Math.max(insets.bottom, SPACING.sm) },
      ]}
    >
      <View
        style={[
          styles.bar,
          { borderColor: c.borderStrong },
        ]}
      >
        <BlurView
          tint={c.glassTint}
          intensity={isDark ? 60 : 80}
          blurMethod={
            Platform.OS === 'android' ? 'dimezisBlurView' : undefined
          }
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)']
              : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.35)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {state.routes.map((route, idx) => {
          const focused = state.index === idx;
          const { options } = descriptors[route.key]!;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const icon = options.tabBarIcon?.({
            focused,
            color: focused ? COLORS.brand : c.textMuted,
            size: 22,
          });
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tab,
                pressed && { opacity: 0.7 },
              ]}
            >
              {focused ? (
                <View style={styles.activePill}>
                  <LinearGradient
                    colors={[COLORS.brandLight, COLORS.brand]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              ) : null}
              <View style={{ alignItems: 'center', gap: 2 }}>
                {icon}
                <Text
                  style={{
                    fontSize: 11,
                    color: focused ? COLORS.brand : c.textMuted,
                    fontWeight: focused ? '700' : '500',
                  }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
  },
  bar: {
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
});
