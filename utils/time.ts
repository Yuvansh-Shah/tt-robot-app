export function formatMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatHhMm(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function bpmToInterval(bpm: number): string {
  const sec = 60 / Math.max(1, bpm);
  if (sec < 1) return `~${Math.round(60 / Math.max(1, bpm) * 1000)}ms between balls`;
  return `~1 ball every ${sec.toFixed(1)}s`;
}

export function relativeDay(timestamp: number, now = Date.now()): string {
  const d = new Date(timestamp);
  const today = new Date(now);
  const dayMs = 24 * 60 * 60 * 1000;
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = Math.round((b - a) / dayMs);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString();
}
