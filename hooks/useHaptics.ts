import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/stores/settingsStore';

export function useHaptics() {
  const enabled = useSettingsStore((s) => s.haptics);
  return {
    light: () => {
      if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },
    medium: () => {
      if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    },
    success: () => {
      if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    warning: () => {
      if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    },
    selection: () => {
      if (enabled) Haptics.selectionAsync().catch(() => {});
    },
  };
}
