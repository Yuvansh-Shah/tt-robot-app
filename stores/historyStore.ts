import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Session } from '@/types/session';

interface HistoryState {
  sessions: Session[];
  hasSeededFake: boolean;
  addSession: (s: Session) => void;
  deleteSession: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  reset: () => void;
  setFakeSessions: (sessions: Session[]) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      hasSeededFake: false,
      addSession: (s) =>
        set((st) => ({
          sessions: [s, ...st.sessions].sort((a, b) => b.startedAt - a.startedAt),
        })),
      deleteSession: (id) =>
        set((st) => ({ sessions: st.sessions.filter((s) => s.id !== id) })),
      updateNote: (id, note) =>
        set((st) => ({
          sessions: st.sessions.map((s) => (s.id === id ? { ...s, note } : s)),
        })),
      reset: () => set({ sessions: [], hasSeededFake: false }),
      setFakeSessions: (sessions) =>
        set({
          sessions: [...sessions].sort((a, b) => b.startedAt - a.startedAt),
          hasSeededFake: true,
        }),
    }),
    {
      name: '@store/history',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
