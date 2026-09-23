import type { Balance } from './balance';
import { autoBuild } from './buildings';
import { updateIdeas, updateOps } from './compute';
import { conflicts } from './conflict';
import { checkEnd, updateEnd } from './end';
import { updateFleetCompute } from './fleet';
import { checkMilestones } from './messages';
import { applyAutoPrice, buyParts, checkReputation, fluctuatePartsPrice, sell, updateDemand, updateStats } from './phase1';
import { gigaProduction, mineOre, smelt } from './phase2';
import { drift, explore, hazards, seedBuild, seedReplicate } from './phase3';
import { updatePower } from './power';
import { produce } from './production';
import { scanProjects } from './projects';
import { opsCapacity } from './formulas';
import { quantumClock } from './quantum';
import type { GameState } from './state';
import { autoTourney } from './strategy';
import { treasuryBuy, treasuryUpdate } from './treasury';

/** Fast-Tick, 10 ms. Reihenfolge nach Spec 2.1. */
export function fastTick(s: GameState, b: Balance): void {
  s.tick++;
  checkMilestones(s, b);
  if (s.flags.compute) updateOps(s, b);
  if (s.phase === 1) checkReputation(s, b);
  if (s.flags.quantum) quantumClock(s, b);
  scanProjects(s, b);
  if (s.phase === 1 && s.flags.autoBuy && s.parts <= 1) buyParts(s, b);
  if (s.phase === 3) explore(s, b);
  if (s.phase === 2 && s.flags.power) updatePower(s, b);
  if (s.phase >= 2) {
    updateFleetCompute(s, b);
    mineOre(s, b);
    smelt(s, b);
    gigaProduction(s);
  }
  // Nur einmal pro Spielsekunde prüfen: canBuild()/buildCost() sind für große Stapel (bis 1 000
  // Stück) teuer, jeden Fast-Tick (alle 10 ms) wäre das ein 100-facher Overhead ohne Nutzen.
  if (s.phase === 2 && s.flags.autoBuild && s.tick % (1000 / b.tick.fastMs) === 0) autoBuild(s, b);
  if (s.phase === 3) {
    hazards(s, b);
    seedBuild(s, b);
    seedReplicate(s, b);
    drift(s, b);
    conflicts(s, b);
    checkEnd(s, b);
  }
  if (s.phase === 1) {
    produce(s, (s.robotBoost * s.robots) / 100);
    produce(s, s.lineBoost * s.lines * b.phase1.lineOutputPerTick);
    updateDemand(s, b);
  }
  if (s.flags.ideas && s.ops >= opsCapacity(s, b)) updateIdeas(s, b);
  if (s.flags.strategy && s.flags.autoTourney) autoTourney(s, b);
  updateEnd(s);

  const slowEvery = b.tick.slowMs / b.tick.fastMs;
  if (s.tick % slowEvery === 0) slowTick(s, b);
  if (s.flags.treasury && s.phase === 1) {
    if (s.tick % b.treasury.buyEveryTicks === 0) treasuryBuy(s, b);
    if (s.tick % b.treasury.updateEveryTicks === 0) treasuryUpdate(s, b);
  }
}

/** Slow-Tick, 100 ms (Spec 2.2). Autosave übernimmt der Browser-Treiber. */
function slowTick(s: GameState, b: Balance): void {
  if (s.phase === 1) fluctuatePartsPrice(s, b);
  if (s.phase === 1) sell(s, b);
  s.stats.secTimer++;
  if (s.stats.secTimer >= 10) {
    s.stats.secTimer = 0;
    updateStats(s);
    applyAutoPrice(s, b);
  }
}

/** n Fast-Ticks rechnen. */
export function step(s: GameState, b: Balance, n = 1): void {
  for (let k = 0; k < n; k++) fastTick(s, b);
}
