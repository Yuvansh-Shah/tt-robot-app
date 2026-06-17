import type { BallParameters, ConnectionState } from '@/types/robot';
import type { Drill } from '@/types/drill';

export type Unsubscribe = () => void;

export interface RobotService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConnectionState(): ConnectionState;
  onConnectionStateChange(cb: (s: ConnectionState) => void): Unsubscribe;

  start(params: BallParameters): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;

  updateParameters(params: Partial<BallParameters>): Promise<void>;
  runDrill(drill: Drill): Promise<void>;

  onBallThrown(cb: () => void): Unsubscribe;
  isRunning(): boolean;
  getCurrentParameters(): BallParameters | null;
}

export interface DebugRobotControls {
  forceDisconnect(): void;
  forceError(): void;
  setCadenceJitter(jitter: number): void;
}
