import type { Balance } from './balance';
import { produce } from './production';
import type { GameState } from './state';

/** Anteil Fahren am Regler Fahren ↔ Rechnen (6.1). */
export function driveWeight(s: GameState): number {
  return (200 - s.fleet.slider) / 100;
}

function unitBoost(s: GameState, count: number): number {
  return s.industry.droneBoost > 1 ? s.industry.droneBoost * count : 1;
}

export function mineOre(s: GameState, b: Balance): void {
  const i = s.industry;
  let m = s.power.powMod * unitBoost(s, i.trucks) * i.trucks * b.phase2.truckRate * i.unitRateMult * driveWeight(s);
  m = Math.min(m, i.ore);
  if (!(m > 0)) return;
  i.ore -= m;
  i.oreMined += m;
}

export function smelt(s: GameState, b: Balance): void {
  const i = s.industry;
  let a = s.power.powMod * unitBoost(s, i.smelters) * i.smelters * b.phase2.smelterRate * i.unitRateMult * driveWeight(s);
  a = Math.min(a, i.oreMined);
  if (!(a > 0)) return;
  i.oreMined -= a;
  s.parts += a;
}

export function gigaProduction(s: GameState): void {
  const i = s.industry;
  if (i.gigas <= 0) return;
  const gfEff = i.gfBoost > 1 ? i.gfBoost * i.gigas : 1;
  produce(s, s.power.powMod * gfEff * i.gigas * i.gigaRate);
}
