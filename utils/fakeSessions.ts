import type { Session } from '@/types/session';
import type { Drill } from '@/types/drill';
import { uid } from './id';

const DAY = 24 * 60 * 60 * 1000;

export function generateFakeSessions(drills: Drill[], count = 30): Session[] {
  if (drills.length === 0) return [];
  const now = Date.now();
  const out: Session[] = [];
  // Spread sessions over the last 60 days with some clustering
  let cursor = now;
  for (let i = 0; i < count; i++) {
    const daysBack = Math.floor((i / count) * 60) + Math.floor(Math.random() * 3);
    const sessionStart = now - daysBack * DAY - Math.floor(Math.random() * 6) * 60 * 60 * 1000;
    const segCount = 1 + Math.floor(Math.random() * 3);
    const segments = [];
    let totalBalls = 0;
    let totalDur = 0;
    let segStart = sessionStart;
    for (let s = 0; s < segCount; s++) {
      const drill = drills[Math.floor(Math.random() * drills.length)]!;
      const segDurMs = (2 + Math.floor(Math.random() * 8)) * 60 * 1000;
      const params =
        drill.type === 'static' && drill.params
          ? drill.params
          : drill.shots?.[0]?.params ?? {
              speed: 5,
              spinType: 'topspin' as const,
              spinIntensity: 5,
              placement: ['mid_mid' as const],
              oscillation: 'sequential' as const,
              trajectory: 5,
              frequency: 40,
            };
      const ballCount = Math.floor((segDurMs / 60000) * params.frequency * (0.85 + Math.random() * 0.3));
      totalBalls += ballCount;
      totalDur += segDurMs;
      segments.push({
        drillId: drill.id,
        drillName: drill.name,
        drillColor: drill.color,
        startedAt: segStart,
        endedAt: segStart + segDurMs,
        ballCount,
        paramsSnapshot: params,
      });
      segStart += segDurMs;
    }
    const notes = [
      undefined,
      'Felt good, decent consistency.',
      'Backhand off today.',
      'Loops landed better than last time.',
      'Footwork drill smoked me.',
      undefined,
      undefined,
    ];
    out.push({
      id: uid(),
      startedAt: sessionStart,
      endedAt: sessionStart + totalDur,
      durationMs: totalDur,
      totalBalls,
      segments,
      note: notes[Math.floor(Math.random() * notes.length)],
    });
    cursor -= DAY;
  }
  return out;
}
