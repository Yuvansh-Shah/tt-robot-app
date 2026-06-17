export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type SpinType =
  | 'topspin'
  | 'backspin'
  | 'left_sidespin'
  | 'right_sidespin'
  | 'none';

export type PlacementZoneName =
  | 'far_left'
  | 'mid_left'
  | 'wide_left'
  | 'far_mid'
  | 'mid_mid'
  | 'wide_mid'
  | 'far_right'
  | 'mid_right'
  | 'wide_right';

export interface CustomPlacement {
  custom: { x: number; y: number }; // 0–1 normalized
}

export type PlacementZone = PlacementZoneName | CustomPlacement;

export type OscillationMode = 'sequential' | 'random';

export interface BallParameters {
  speed: number; // 1–10
  spinType: SpinType;
  spinIntensity: number; // 0–10
  placement: PlacementZone[];
  oscillation: OscillationMode;
  trajectory: number; // 1–10
  frequency: number; // balls per minute, 15–90
  ballCountTarget?: number;
}

export const PLACEMENT_ZONES: PlacementZoneName[] = [
  'far_left',
  'far_mid',
  'far_right',
  'mid_left',
  'mid_mid',
  'mid_right',
  'wide_left',
  'wide_mid',
  'wide_right',
];

export function isCustomPlacement(p: PlacementZone): p is CustomPlacement {
  return typeof p === 'object' && 'custom' in p;
}
