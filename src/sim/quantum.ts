import type { Balance } from './balance';
import { opsCapacity } from './formulas';
import type { GameState } from './state';

/** Jeder Fast-Tick (5.3). */
export function quantumClock(s: GameState, b: Balance): void {
  s.quantum.clock += b.quantum.clockStep;
}

export function chipValue(s: GameState, i: number): number {
  if (i >= s.quantum.chips) return 0;
  return Math.sin(s.quantum.clock * 0.1 * (i + 1));
}

export function quantumSum(s: GameState, b: Balance): number {
  let sum = 0;
  for (let i = 0; i < b.quantum.chips; i++) sum += chipValue(s, i);
  return sum;
}

/** Button „Berechnen“. Kann bei negativer Überlagerung Ops kosten. */
export function quantumCompute(s: GameState, b: Balance): boolean {
  if (!s.flags.quantum || s.quantum.chips < 1) return false;
  let q = Math.ceil(b.quantum.scale * quantumSum(s, b));
  const buffer = opsCapacity(s, b) - s.stdOps;
  if (q > buffer) {
    s.tempOps += Math.max(0, Math.ceil(q / (s.tempOps / 100 + 5)) - buffer);
    q = buffer;
    s.tempDecay = 0.01;
    s.tempTimer = 0;
  }
  s.stdOps = Math.max(0, s.stdOps + q);
  s.ops = Math.floor(s.stdOps + s.tempOps);
  s.quantum.last = q;
  return true;
}
