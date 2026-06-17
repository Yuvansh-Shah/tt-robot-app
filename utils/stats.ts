import type { Session } from '@/types/session';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function ballsByDay(sessions: Session[], days = 84): { day: number; balls: number }[] {
  const today = startOfDay(Date.now());
  const buckets = new Map<number, number>();
  for (let i = 0; i < days; i++) {
    buckets.set(today - i * DAY_MS, 0);
  }
  for (const s of sessions) {
    const k = startOfDay(s.startedAt);
    if (buckets.has(k)) {
      buckets.set(k, (buckets.get(k) ?? 0) + s.totalBalls);
    }
  }
  const out: { day: number; balls: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = today - i * DAY_MS;
    out.push({ day, balls: buckets.get(day) ?? 0 });
  }
  return out;
}

export function ballsByWeek(sessions: Session[], weeks = 12): { weekStart: number; balls: number }[] {
  const today = startOfDay(Date.now());
  const dow = new Date(today).getDay(); // 0=Sun
  const thisWeekStart = today - dow * DAY_MS;
  const buckets = new Map<number, number>();
  for (let i = 0; i < weeks; i++) {
    buckets.set(thisWeekStart - i * 7 * DAY_MS, 0);
  }
  for (const s of sessions) {
    const sStart = startOfDay(s.startedAt);
    const sDow = new Date(sStart).getDay();
    const wStart = sStart - sDow * DAY_MS;
    if (buckets.has(wStart)) {
      buckets.set(wStart, (buckets.get(wStart) ?? 0) + s.totalBalls);
    }
  }
  const out: { weekStart: number; balls: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = thisWeekStart - i * 7 * DAY_MS;
    out.push({ weekStart, balls: buckets.get(weekStart) ?? 0 });
  }
  return out;
}

export function topDrills(sessions: Session[], n = 5): { name: string; color: string; balls: number }[] {
  const tally = new Map<string, { name: string; color: string; balls: number }>();
  for (const s of sessions) {
    for (const seg of s.segments) {
      const key = seg.drillId ?? `free:${seg.drillName}`;
      const cur = tally.get(key);
      if (cur) {
        cur.balls += seg.ballCount;
      } else {
        tally.set(key, { name: seg.drillName, color: seg.drillColor, balls: seg.ballCount });
      }
    }
  }
  return Array.from(tally.values()).sort((a, b) => b.balls - a.balls).slice(0, n);
}

export function currentStreak(sessions: Session[], now = Date.now()): number {
  if (sessions.length === 0) return 0;
  const days = new Set<number>();
  for (const s of sessions) {
    days.add(startOfDay(s.startedAt));
  }
  let streak = 0;
  let cur = startOfDay(now);
  // streak counts today only if there's a session today; otherwise start at yesterday
  if (!days.has(cur)) {
    cur -= DAY_MS;
  }
  while (days.has(cur)) {
    streak += 1;
    cur -= DAY_MS;
  }
  return streak;
}

export interface StatsSummary {
  totalSessions: number;
  totalDurationMs: number;
  totalBalls: number;
  streak: number;
}

export function summarize(sessions: Session[]): StatsSummary {
  let totalDurationMs = 0;
  let totalBalls = 0;
  for (const s of sessions) {
    totalDurationMs += s.durationMs;
    totalBalls += s.totalBalls;
  }
  return {
    totalSessions: sessions.length,
    totalDurationMs,
    totalBalls,
    streak: currentStreak(sessions),
  };
}

export function filterByRange(
  sessions: Session[],
  range: 'all' | '30d' | '7d',
  now = Date.now(),
): Session[] {
  if (range === 'all') return sessions;
  const days = range === '7d' ? 7 : 30;
  const cutoff = now - days * DAY_MS;
  return sessions.filter((s) => s.startedAt >= cutoff);
}
