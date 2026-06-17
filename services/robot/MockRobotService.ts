import type { BallParameters, ConnectionState } from '@/types/robot';
import type { Drill, Shot } from '@/types/drill';
import type { DebugRobotControls, RobotService, Unsubscribe } from './types';

type Listener<T> = (v: T) => void;

function bpmToMs(bpm: number) {
  return Math.max(60_000 / Math.max(1, bpm), 100);
}

export class MockRobotService implements RobotService, DebugRobotControls {
  private state: ConnectionState = 'disconnected';
  private connListeners = new Set<Listener<ConnectionState>>();
  private ballListeners = new Set<Listener<void>>();

  private currentParams: BallParameters | null = null;
  private throwTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private paused = false;

  // sequence drill walker
  private sequenceShots: Shot[] | null = null;
  private sequenceIdx = 0;
  private sequenceBallsThisShot = 0;
  private sequenceShotStartedAt = 0;

  private cadenceJitter = 0;

  // ---- connection ----
  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') return;
    this.setConnState('connecting');
    await new Promise((r) => setTimeout(r, 2000));
    if (Math.random() < 0.05) {
      this.setConnState('error');
      console.log('[MockRobot] connect failed (simulated)');
      return;
    }
    this.setConnState('connected');
    console.log('[MockRobot] connected');
  }

  async disconnect(): Promise<void> {
    this.stopInternal();
    this.setConnState('disconnected');
    console.log('[MockRobot] disconnected');
  }

  getConnectionState() {
    return this.state;
  }

  onConnectionStateChange(cb: Listener<ConnectionState>): Unsubscribe {
    this.connListeners.add(cb);
    return () => this.connListeners.delete(cb);
  }

  private setConnState(s: ConnectionState) {
    if (this.state === s) return;
    this.state = s;
    this.connListeners.forEach((cb) => cb(s));
  }

  // ---- run controls ----
  async start(params: BallParameters): Promise<void> {
    this.currentParams = params;
    this.running = true;
    this.paused = false;
    this.sequenceShots = null;
    console.log('[MockRobot] start', params);
    this.scheduleNext();
  }

  async pause(): Promise<void> {
    if (!this.running) return;
    this.paused = true;
    this.clearTimer();
    console.log('[MockRobot] pause');
  }

  async resume(): Promise<void> {
    if (!this.running || !this.paused) return;
    this.paused = false;
    console.log('[MockRobot] resume');
    this.scheduleNext();
  }

  async stop(): Promise<void> {
    this.stopInternal();
    console.log('[MockRobot] stop');
  }

  private stopInternal() {
    this.running = false;
    this.paused = false;
    this.clearTimer();
    this.sequenceShots = null;
    this.sequenceIdx = 0;
    this.sequenceBallsThisShot = 0;
  }

  async updateParameters(p: Partial<BallParameters>): Promise<void> {
    if (!this.currentParams) {
      this.currentParams = { ...defaultStartParams(), ...p };
    } else {
      this.currentParams = { ...this.currentParams, ...p };
    }
    console.log('[MockRobot] updateParameters', p);
    if (this.running && !this.paused) {
      this.clearTimer();
      this.scheduleNext();
    }
  }

  async runDrill(drill: Drill): Promise<void> {
    if (drill.type === 'static' && drill.params) {
      await this.start(drill.params);
      return;
    }
    if (drill.type === 'sequence' && drill.shots && drill.shots.length > 0) {
      this.sequenceShots = drill.shots;
      this.sequenceIdx = 0;
      this.sequenceBallsThisShot = 0;
      this.sequenceShotStartedAt = Date.now();
      const first = drill.shots[0]!;
      await this.start(first.params);
      return;
    }
  }

  // ---- ball-thrown ----
  onBallThrown(cb: Listener<void>): Unsubscribe {
    this.ballListeners.add(cb);
    return () => this.ballListeners.delete(cb);
  }

  isRunning() {
    return this.running && !this.paused;
  }

  getCurrentParameters() {
    return this.currentParams;
  }

  // ---- internals ----
  private scheduleNext() {
    if (!this.running || this.paused || !this.currentParams) return;
    const baseMs = bpmToMs(this.currentParams.frequency);
    const jitter = this.cadenceJitter;
    const jitterMs = baseMs * jitter * (Math.random() * 2 - 1);
    const wait = Math.max(80, baseMs + jitterMs);
    this.throwTimer = setTimeout(() => this.tick(), wait);
  }

  private tick() {
    if (!this.running || this.paused) return;
    this.ballListeners.forEach((cb) => cb());

    // advance sequence if needed
    if (this.sequenceShots && this.currentParams) {
      this.sequenceBallsThisShot += 1;
      const shot = this.sequenceShots[this.sequenceIdx]!;
      const elapsedMs = Date.now() - this.sequenceShotStartedAt;
      const ballDone =
        shot.ballCount !== undefined &&
        this.sequenceBallsThisShot >= shot.ballCount;
      const durationDone =
        shot.duration !== undefined && elapsedMs >= shot.duration * 1000;
      if (ballDone || durationDone) {
        this.sequenceIdx = (this.sequenceIdx + 1) % this.sequenceShots.length;
        this.sequenceBallsThisShot = 0;
        this.sequenceShotStartedAt = Date.now();
        const next = this.sequenceShots[this.sequenceIdx]!;
        this.currentParams = next.params;
        console.log('[MockRobot] sequence → shot', this.sequenceIdx);
      }
    }

    this.scheduleNext();
  }

  private clearTimer() {
    if (this.throwTimer) {
      clearTimeout(this.throwTimer);
      this.throwTimer = null;
    }
  }

  // ---- debug controls ----
  forceDisconnect() {
    this.stopInternal();
    this.setConnState('disconnected');
    console.log('[MockRobot] forced disconnect');
  }

  forceError() {
    this.stopInternal();
    this.setConnState('error');
    console.log('[MockRobot] forced error');
  }

  setCadenceJitter(jitter: number) {
    this.cadenceJitter = Math.max(0, Math.min(1, jitter));
    console.log('[MockRobot] cadence jitter', this.cadenceJitter);
  }
}

function defaultStartParams(): BallParameters {
  return {
    speed: 5,
    spinType: 'topspin',
    spinIntensity: 5,
    placement: ['mid_mid'],
    oscillation: 'sequential',
    trajectory: 5,
    frequency: 40,
  };
}
