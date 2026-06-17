import { MockRobotService } from './MockRobotService';
import type { DebugRobotControls, RobotService } from './types';

// Single entry point. Phase 2 swaps this for the BLE implementation.
const instance = new MockRobotService();

export const robot: RobotService = instance;
export const robotDebug: DebugRobotControls = instance;
export type { RobotService } from './types';
