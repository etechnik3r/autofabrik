import type { Balance } from './balance';
import type { GameState } from './state';

/** Stromnetz, jeder Fast-Tick in Phase 2 (6.3). Anzeige in MW = intern · 100. */
export function updatePower(s: GameState, b: Balance): void {
  const p = s.power;
  const i = s.industry;
  const pb = b.phase2;
  const supply = i.solar * pb.solarOutput;
  const demand = i.gigas * pb.gigaDemand + (i.trucks + i.smelters) * pb.unitDemand;
  const cap = i.battery * pb.storageCapacity;
  p.supply = supply;
  p.demand = demand;
  if (supply >= demand) {
    p.stored = Math.min(cap, p.stored + supply - demand);
    p.powMod = Math.max(p.powMod, 1);
    if (s.flags.momentum) p.powMod += pb.momentumStep;
  } else {
    const deficit = demand - supply;
    if (p.stored >= deficit) {
      p.stored -= deficit;
      p.powMod = Math.max(p.powMod, 1);
      if (s.flags.momentum) p.powMod += pb.momentumStep;
    } else {
      p.powMod = (supply + p.stored) / demand;
      p.stored = 0;
    }
  }
}
