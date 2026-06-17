import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Drill } from '@/types/drill';
import { PRESET_DRILLS } from '@/constants/drills';
import { uid } from '@/utils/id';

interface DrillState {
  drills: Drill[];
  hasSeeded: boolean;
  seedIfNeeded: () => void;
  createDrill: (d: Omit<Drill, 'id' | 'createdAt' | 'isPreset'>) => Drill;
  updateDrill: (id: string, patch: Partial<Drill>) => void;
  deleteDrill: (id: string) => void;
  duplicateDrill: (id: string) => Drill | null;
  markUsed: (id: string) => void;
  getById: (id: string) => Drill | undefined;
}

export const useDrillStore = create<DrillState>()(
  persist(
    (set, get) => ({
      drills: [],
      hasSeeded: false,

      seedIfNeeded: () => {
        if (get().hasSeeded && get().drills.length > 0) return;
        set({ drills: PRESET_DRILLS, hasSeeded: true });
      },

      createDrill: (d) => {
        const drill: Drill = {
          ...d,
          id: uid(),
          createdAt: Date.now(),
          isPreset: false,
        };
        set((s) => ({ drills: [...s.drills, drill] }));
        return drill;
      },

      updateDrill: (id, patch) => {
        set((s) => ({
          drills: s.drills.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
      },

      deleteDrill: (id) => {
        set((s) => ({
          drills: s.drills.filter((d) => !(d.id === id && !d.isPreset)),
        }));
      },

      duplicateDrill: (id) => {
        const src = get().drills.find((d) => d.id === id);
        if (!src) return null;
        const copy: Drill = {
          ...src,
          id: uid(),
          name: `${src.name} (copy)`,
          isPreset: false,
          createdAt: Date.now(),
          lastUsedAt: undefined,
        };
        set((s) => ({ drills: [...s.drills, copy] }));
        return copy;
      },

      markUsed: (id) => {
        set((s) => ({
          drills: s.drills.map((d) =>
            d.id === id ? { ...d, lastUsedAt: Date.now() } : d,
          ),
        }));
      },

      getById: (id) => get().drills.find((d) => d.id === id),
    }),
    {
      name: '@store/drills',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ drills: s.drills, hasSeeded: s.hasSeeded }),
    },
  ),
);
