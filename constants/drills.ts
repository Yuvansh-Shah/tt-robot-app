import type { BallParameters } from '@/types/robot';
import type { Drill } from '@/types/drill';

export const DEFAULT_PARAMS: BallParameters = {
  speed: 5,
  spinType: 'topspin',
  spinIntensity: 5,
  placement: ['mid_mid'],
  oscillation: 'sequential',
  trajectory: 5,
  frequency: 40,
};

export function makePreset(
  id: string,
  name: string,
  category: Drill['category'],
  color: string,
  description: string,
  body:
    | { type: 'static'; params: BallParameters }
    | { type: 'sequence'; shots: Drill['shots'] },
): Drill {
  return {
    id,
    name,
    description,
    category,
    color,
    isPreset: true,
    createdAt: 0,
    ...body,
  };
}

export const PRESET_DRILLS: Drill[] = [
  makePreset(
    'preset-fh-drive',
    'Forehand Drive',
    'warmup',
    '#E94B3C',
    'Steady forehand drives, straight to your forehand.',
    {
      type: 'static',
      params: {
        speed: 4,
        spinType: 'topspin',
        spinIntensity: 3,
        placement: ['mid_right'],
        oscillation: 'sequential',
        trajectory: 5,
        frequency: 40,
      },
    },
  ),
  makePreset(
    'preset-bh-drive',
    'Backhand Drive',
    'warmup',
    '#F2A63B',
    'Steady backhand drives to the backhand corner.',
    {
      type: 'static',
      params: {
        speed: 4,
        spinType: 'topspin',
        spinIntensity: 3,
        placement: ['mid_left'],
        oscillation: 'sequential',
        trajectory: 5,
        frequency: 40,
      },
    },
  ),
  makePreset(
    'preset-fh-bh-alt',
    'FH–BH Alternating',
    'technique',
    '#3B82F6',
    'Predictable alternating forehand / backhand.',
    {
      type: 'sequence',
      shots: [
        {
          id: 'shot-1',
          ballCount: 1,
          params: {
            speed: 5,
            spinType: 'topspin',
            spinIntensity: 4,
            placement: ['mid_right'],
            oscillation: 'sequential',
            trajectory: 5,
            frequency: 45,
          },
        },
        {
          id: 'shot-2',
          ballCount: 1,
          params: {
            speed: 5,
            spinType: 'topspin',
            spinIntensity: 4,
            placement: ['mid_left'],
            oscillation: 'sequential',
            trajectory: 5,
            frequency: 45,
          },
        },
      ],
    },
  ),
  makePreset(
    'preset-falkenberg',
    'Falkenberg',
    'footwork',
    '#8B5CF6',
    'BH corner → FH corner → middle. Classic footwork drill.',
    {
      type: 'sequence',
      shots: [
        {
          id: 'shot-1',
          ballCount: 1,
          params: {
            speed: 5,
            spinType: 'topspin',
            spinIntensity: 5,
            placement: ['mid_left'],
            oscillation: 'sequential',
            trajectory: 5,
            frequency: 40,
          },
        },
        {
          id: 'shot-2',
          ballCount: 1,
          params: {
            speed: 5,
            spinType: 'topspin',
            spinIntensity: 5,
            placement: ['mid_right'],
            oscillation: 'sequential',
            trajectory: 5,
            frequency: 40,
          },
        },
        {
          id: 'shot-3',
          ballCount: 1,
          params: {
            speed: 5,
            spinType: 'topspin',
            spinIntensity: 5,
            placement: ['mid_mid'],
            oscillation: 'sequential',
            trajectory: 5,
            frequency: 40,
          },
        },
      ],
    },
  ),
  makePreset(
    'preset-topspin-loop',
    'Topspin Loop Warmup',
    'warmup',
    '#2DBE6C',
    'Heavy topspin loops to the forehand. Open up your stroke.',
    {
      type: 'static',
      params: {
        speed: 6,
        spinType: 'topspin',
        spinIntensity: 8,
        placement: ['far_right', 'mid_right'],
        oscillation: 'random',
        trajectory: 7,
        frequency: 35,
      },
    },
  ),
  makePreset(
    'preset-backspin-push',
    'Backspin Push Practice',
    'technique',
    '#14B8A6',
    'Heavy backspin pushes — work on your touch and short game.',
    {
      type: 'static',
      params: {
        speed: 3,
        spinType: 'backspin',
        spinIntensity: 8,
        placement: ['far_mid', 'far_left', 'far_right'],
        oscillation: 'random',
        trajectory: 3,
        frequency: 30,
      },
    },
  ),
  makePreset(
    'preset-random-osc',
    'Random Oscillation',
    'footwork',
    '#EC4899',
    'Random placement across the full table. Reactive footwork.',
    {
      type: 'static',
      params: {
        speed: 5,
        spinType: 'topspin',
        spinIntensity: 5,
        placement: [
          'far_left',
          'far_mid',
          'far_right',
          'mid_left',
          'mid_mid',
          'mid_right',
        ],
        oscillation: 'random',
        trajectory: 5,
        frequency: 45,
      },
    },
  ),
  makePreset(
    'preset-serve-return',
    'Serve Return',
    'tactical',
    '#64748B',
    'Heavy backspin to your forehand — simulates a tricky serve.',
    {
      type: 'static',
      params: {
        speed: 3,
        spinType: 'backspin',
        spinIntensity: 9,
        placement: ['far_right'],
        oscillation: 'sequential',
        trajectory: 2,
        frequency: 20,
      },
    },
  ),
  makePreset(
    'preset-footwork-wide',
    'Footwork — Wide Alternating',
    'footwork',
    '#F59E0B',
    'Wide forehand to wide backhand. Big steps, full table.',
    {
      type: 'sequence',
      shots: [
        {
          id: 'shot-1',
          ballCount: 1,
          params: {
            speed: 5,
            spinType: 'topspin',
            spinIntensity: 5,
            placement: ['mid_right'],
            oscillation: 'sequential',
            trajectory: 5,
            frequency: 35,
          },
        },
        {
          id: 'shot-2',
          ballCount: 1,
          params: {
            speed: 5,
            spinType: 'topspin',
            spinIntensity: 5,
            placement: ['mid_left'],
            oscillation: 'sequential',
            trajectory: 5,
            frequency: 35,
          },
        },
      ],
    },
  ),
  makePreset(
    'preset-speed-drill',
    'Speed Drill',
    'tactical',
    '#DC2626',
    'High frequency, high speed. Push your reaction time.',
    {
      type: 'static',
      params: {
        speed: 8,
        spinType: 'topspin',
        spinIntensity: 6,
        placement: ['mid_left', 'mid_right'],
        oscillation: 'random',
        trajectory: 5,
        frequency: 75,
      },
    },
  ),
];
