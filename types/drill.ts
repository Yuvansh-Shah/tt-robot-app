import type { BallParameters } from './robot';

export type DrillCategory =
  | 'warmup'
  | 'technique'
  | 'footwork'
  | 'tactical'
  | 'custom';

export interface Shot {
  id: string;
  params: BallParameters;
  ballCount?: number;
  duration?: number; // seconds
}

export interface Drill {
  id: string;
  name: string;
  description?: string;
  category: DrillCategory;
  color: string;
  isPreset: boolean;
  type: 'static' | 'sequence';
  params?: BallParameters;
  shots?: Shot[];
  createdAt: number;
  lastUsedAt?: number;
}

export const DRILL_CATEGORIES: DrillCategory[] = [
  'warmup',
  'technique',
  'footwork',
  'tactical',
  'custom',
];

export const DRILL_COLORS: string[] = [
  '#E94B3C',
  '#F2A63B',
  '#2DBE6C',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#64748B',
];
