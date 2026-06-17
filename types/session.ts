import type { BallParameters } from './robot';

export interface DrillSegment {
  drillId: string | null; // null = free-form
  drillName: string;
  drillColor: string;
  startedAt: number;
  endedAt: number;
  ballCount: number;
  paramsSnapshot: BallParameters;
}

export interface Session {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  totalBalls: number;
  segments: DrillSegment[];
  note?: string;
}
