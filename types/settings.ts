import type { BallParameters } from './robot';

export type ThemePreference = 'system' | 'light' | 'dark';
export type SpeedUnits = 'scale' | 'metric';

export interface Settings {
  defaults: BallParameters;
  units: SpeedUnits;
  theme: ThemePreference;
  haptics: boolean;
  mockCadenceJitter: number; // 0..1, dev knob
}
