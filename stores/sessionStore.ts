import { create } from 'zustand';
import type { BallParameters } from '@/types/robot';
import type { Drill } from '@/types/drill';
import type { DrillSegment, Session } from '@/types/session';
import { uid } from '@/utils/id';

interface ActiveSegment {
  drillId: string | null;
  drillName: string;
  drillColor: string;
  startedAt: number;
  ballCount: number;
  params: BallParameters;
}

interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  startedAt: number | null;
  pauseStartedAt: number | null;
  pausedAccumMs: number;
  current: ActiveSegment | null;
  pastSegments: DrillSegment[];
  note: string;

  startSession: (opts: {
    drill?: Drill;
    fallbackParams: BallParameters;
  }) => void;
  pause: () => void;
  resume: () => void;
  switchDrill: (drill: Drill) => void;
  switchToFreeform: (params: BallParameters, name?: string) => void;
  incrementBallCount: () => void;
  updateParams: (p: Partial<BallParameters>) => void;
  setNote: (n: string) => void;
  endSession: () => Session | null;
  cancel: () => void;
}

function segmentFromActive(s: ActiveSegment, endedAt: number): DrillSegment {
  return {
    drillId: s.drillId,
    drillName: s.drillName,
    drillColor: s.drillColor,
    startedAt: s.startedAt,
    endedAt,
    ballCount: s.ballCount,
    paramsSnapshot: s.params,
  };
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  isActive: false,
  isPaused: false,
  startedAt: null,
  pauseStartedAt: null,
  pausedAccumMs: 0,
  current: null,
  pastSegments: [],
  note: '',

  startSession: ({ drill, fallbackParams }) => {
    const s = get();
    if (s.isActive) {
      set({
        isActive: false,
        isPaused: false,
        startedAt: null,
        pauseStartedAt: null,
        pausedAccumMs: 0,
        pastSegments: [],
        current: null,
        note: '',
      });
    }
    const now = Date.now();
    const params: BallParameters =
      drill?.type === 'static' && drill.params
        ? drill.params
        : drill?.type === 'sequence' && drill.shots && drill.shots[0]
          ? drill.shots[0].params
          : fallbackParams;
    set({
      isActive: true,
      isPaused: false,
      startedAt: now,
      pauseStartedAt: null,
      pausedAccumMs: 0,
      pastSegments: [],
      note: '',
      current: {
        drillId: drill?.id ?? null,
        drillName: drill?.name ?? 'Free session',
        drillColor: drill?.color ?? '#E94B3C',
        startedAt: now,
        ballCount: 0,
        params,
      },
    });
  },

  pause: () => {
    if (!get().isActive || get().isPaused) return;
    set({ isPaused: true, pauseStartedAt: Date.now() });
  },

  resume: () => {
    const s = get();
    if (!s.isActive || !s.isPaused || s.pauseStartedAt === null) return;
    const add = Date.now() - s.pauseStartedAt;
    set({
      isPaused: false,
      pauseStartedAt: null,
      pausedAccumMs: s.pausedAccumMs + add,
    });
  },

  switchDrill: (drill) => {
    const s = get();
    if (!s.isActive || !s.current) return;
    const now = Date.now();
    const closed = segmentFromActive(s.current, now);
    const params: BallParameters =
      drill.type === 'static' && drill.params
        ? drill.params
        : drill.type === 'sequence' && drill.shots && drill.shots[0]
          ? drill.shots[0].params
          : s.current.params;
    set({
      pastSegments: [...s.pastSegments, closed],
      current: {
        drillId: drill.id,
        drillName: drill.name,
        drillColor: drill.color,
        startedAt: now,
        ballCount: 0,
        params,
      },
    });
  },

  switchToFreeform: (params, name = 'Free session') => {
    const s = get();
    if (!s.isActive || !s.current) return;
    const now = Date.now();
    const closed = segmentFromActive(s.current, now);
    set({
      pastSegments: [...s.pastSegments, closed],
      current: {
        drillId: null,
        drillName: name,
        drillColor: '#E94B3C',
        startedAt: now,
        ballCount: 0,
        params,
      },
    });
  },

  incrementBallCount: () => {
    const s = get();
    if (!s.current || s.isPaused) return;
    set({ current: { ...s.current, ballCount: s.current.ballCount + 1 } });
  },

  updateParams: (p) => {
    const s = get();
    if (!s.current) return;
    set({ current: { ...s.current, params: { ...s.current.params, ...p } } });
  },

  setNote: (n) => set({ note: n }),

  endSession: () => {
    const s = get();
    if (!s.isActive || !s.current || s.startedAt === null) return null;
    const now = Date.now();
    const closed = segmentFromActive(s.current, now);
    const segments = [...s.pastSegments, closed];
    const totalBalls = segments.reduce((acc, x) => acc + x.ballCount, 0);
    const pausedAccum =
      s.pausedAccumMs +
      (s.isPaused && s.pauseStartedAt ? now - s.pauseStartedAt : 0);
    const durationMs = Math.max(0, now - s.startedAt - pausedAccum);
    const session: Session = {
      id: uid(),
      startedAt: s.startedAt,
      endedAt: now,
      durationMs: Math.max(0, durationMs),
      totalBalls,
      segments,
      note: s.note.trim() || undefined,
    };
    set({
      isActive: false,
      isPaused: false,
      startedAt: null,
      pauseStartedAt: null,
      pausedAccumMs: 0,
      pastSegments: [],
      current: null,
      note: '',
    });
    return session;
  },

  cancel: () =>
    set({
      isActive: false,
      isPaused: false,
      startedAt: null,
      pauseStartedAt: null,
      pausedAccumMs: 0,
      pastSegments: [],
      current: null,
      note: '',
    }),
}));
