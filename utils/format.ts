import type { BallParameters, PlacementZone, SpinType } from '@/types/robot';
import { isCustomPlacement } from '@/types/robot';

export const SPIN_LABELS: Record<SpinType, string> = {
  topspin: 'Topspin',
  backspin: 'Backspin',
  left_sidespin: 'Left side',
  right_sidespin: 'Right side',
  none: 'No spin',
};

export const SPIN_GLYPH: Record<SpinType, string> = {
  topspin: '↑',
  backspin: '↓',
  left_sidespin: '←',
  right_sidespin: '→',
  none: '●',
};

export function zoneLabel(p: PlacementZone): string {
  if (isCustomPlacement(p)) return 'Custom';
  return p
    .split('_')
    .map((s) => s[0]!.toUpperCase() + s.slice(1))
    .join(' ');
}

export function placementSummary(placement: PlacementZone[]): string {
  if (placement.length === 0) return 'None';
  if (placement.length === 1) return zoneLabel(placement[0]!);
  return `${placement.length} zones`;
}

export function paramSummary(p: BallParameters): string {
  return `${SPIN_LABELS[p.spinType]} · spd ${p.speed} · ${p.frequency} bpm · ${placementSummary(p.placement)}`;
}

export function speedDisplay(speed: number, units: 'scale' | 'metric'): string {
  if (units === 'scale') return `${speed}`;
  // rough mapping: scale 1..10 → ~4..18 m/s
  const ms = 4 + (speed - 1) * (14 / 9);
  return `${ms.toFixed(1)} m/s`;
}
