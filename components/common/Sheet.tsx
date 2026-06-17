import React, { useEffect } from 'react';
import {
  BackHandler,
  Modal,
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
import { GLASS, RADIUS, SPACING } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Sheet({ visible, onClose, title, children, style }: Props) {
  const { mode, c } = useTheme();
  const isDark = mode === 'dark';

  useEffect(() => {
    if (!visible) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => back.remove();
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,15,10,0.35)' }]}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          {
            borderColor: c.borderStrong,
          },
          style,
        ]}
      >
        <BlurView
          tint={c.glassTint}
          intensity={isDark ? GLASS.intensityStrong : 80}
          blurMethod={
            Platform.OS === 'android' ? 'dimezisBlurView' : undefined
          }
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)']
              : ['rgba(255,255,255,0.70)', 'rgba(255,255,255,0.30)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.grabber, { backgroundColor: c.borderStrong }]} />
        {title ? (
          <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
        ) : null}
        <View style={{ paddingHorizontal: SPACING.md }}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
});
