import type { Balance } from './balance';
import { ideaSpeed, opsCapacity } from './formulas';
import type { GameState } from './state';

/** Ops-Update, jeder Fast-Tick (4.2). */
export function updateOps(s: GameState, b: Balance): void {
  const cap = opsCapacity(s, b);
  if (s.tempOps > 0) {
    s.tempTimer++;
    if (s.tempTimer > b.compute.tempOpsDelayTicks) s.tempDecay += b.compute.tempOpsDecayStep;
    s.tempOps = Math.max(0, Math.round(s.tempOps - s.tempDecay));
    if (s.tempOps + s.stdOps < cap) {
      s.stdOps += s.tempOps;
      s.tempOps = 0;
    }
  } else {
    s.tempOps = 0;
  }
  s.ops = Math.floor(s.stdOps + s.tempOps);
  if (s.ops < cap) {
    s.stdOps += Math.min(s.cores * b.compute.opsPerCorePerTick, cap - s.ops);
  }
  s.stdOps = Math.min(s.stdOps, cap);
  s.ops = Math.floor(s.stdOps + s.tempOps);
}

/** Ideen entstehen nur bei vollem Speicher (4.3). */
export function updateIdeas(s: GameState, b: Balance): void {
  const ss = s.ideaSpeed * (1 + s.prestige.ideas * b.prestige.ideasBonus);
  const thr = b.compute.ideaThreshold / ss;
  s.ideaCounter++;
  if (s.ideaCounter >= thr) {
    s.ideas += thr >= 1 ? 1 : ss / b.compute.ideaThreshold;
    s.ideaCounter = 0;
  }
}

/** Zieht Ops ab: erst Standard-Ops, dann temporäre. */
export function spendOps(s: GameState, amount: number): void {
  const fromStd = Math.min(amount, s.stdOps);
  s.stdOps -= fromStd;
  s.tempOps = Math.max(0, s.tempOps - (amount - fromStd));
  s.ops = Math.floor(s.stdOps + s.tempOps);
}

/** Freie Kapazität für Kerne/Speicher: Reputation in Phase 1, Rechenspenden danach. */
export function canAllocateCompute(s: GameState): boolean {
  if (s.phase === 1) return s.rep > s.cores + s.storage;
  return s.fleet.gifts >= 1;
}

export function allocateCompute(s: GameState, what: 'core' | 'storage'): boolean {
  if (!canAllocateCompute(s)) return false;
  if (s.phase > 1) s.fleet.gifts -= 1;
  if (what === 'core') {
    s.cores++;
    s.ideaSpeed = ideaSpeed(s.cores);
  } else {
    s.storage++;
  }
  return true;
}
