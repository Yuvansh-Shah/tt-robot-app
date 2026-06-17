import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Settings, SpeedUnits, ThemePreference } from '@/types/settings';
import type { BallParameters } from '@/types/robot';
import { DEFAULT_PARAMS } from '@/constants/drills';

interface SettingsState extends Settings {
  setTheme: (t: ThemePreference) => void;
  setUnits: (u: SpeedUnits) => void;
  setHaptics: (b: boolean) => void;
  setDefaults: (p: BallParameters) => void;
  setMockCadenceJitter: (n: number) => void;
  resetAll: () => void;
}

const initial: Settings = {
  defaults: DEFAULT_PARAMS,
  units: 'scale',
  theme: 'system',
  haptics: true,
  mockCadenceJitter: 0,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initial,
      setTheme: (t) => set({ theme: t }),
      setUnits: (u) => set({ units: u }),
      setHaptics: (b) => set({ haptics: b }),
      setDefaults: (p) => set({ defaults: p }),
      setMockCadenceJitter: (n) => set({ mockCadenceJitter: n }),
      resetAll: () => set(initial),
    }),
    {
      name: '@store/settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
