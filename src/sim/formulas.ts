import type { Balance } from './balance';
import type { GameState } from './state';

/** Reine Formeln aus der Spec. Werden von Simulation, UI und Bots gemeinsam genutzt. */

export function robotCost(n: number, b: Balance): number {
  const p = b.phase1;
  return n === 0 ? p.robotFirstCost : p.robotCostScale * (Math.pow(p.robotCostBase, n) + p.robotCostOffset);
}

export function lineCost(n: number, b: Balance): number {
  const p = b.phase1;
  return n === 0 ? p.lineFirstCost : p.lineCostScale * Math.pow(p.lineCostBase, n);
}

/** Konstante K der Nachfrage: demand = K / price. */
export function demandConstant(s: GameState, b: Balance): number {
  const adMult = Math.pow(b.phase1.adDemandFactor, s.adLevel - 1);
  return (
    b.phase1.demandConstant * adMult * s.adEffect * s.demandBoost * (1 + s.prestige.market * b.prestige.marketBonus)
  );
}

/** Erwartete Absatzrate in Autos/s bei gegebener Nachfrage (3.5). */
export function expectedSales(demand: number, b: Balance): number {
  const slowPerSec = 1000 / b.tick.slowMs;
  return slowPerSec * Math.min(demand / 100, 1) * Math.floor(b.phase1.salesFactor * Math.pow(demand, b.phase1.salesExponent));
}

/** Optimaler Preis (3.5) für Produktionsrate P [Autos/s]. */
export function optimalPrice(P: number, K: number, b: Balance): number {
  const e = b.phase1.salesExponent;
  const f = b.phase1.salesFactor;
  const slowPerSec = 1000 / b.tick.slowMs;
  let d = Math.pow(P / ((slowPerSec * f) / 100), 1 / (e + 1));
  if (d >= 100) d = Math.pow(P / (slowPerSec * f), 1 / e);
  return K / Math.max(d, 1e-9);
}

/** Ideengeschwindigkeit (4.3). */
export function ideaSpeed(cores: number): number {
  if (cores <= 1) return 1;
  return Math.log10(cores) * Math.pow(cores, 1.1) + cores - 1;
}

export function treasuryUpgradeCost(level: number, b: Balance): number {
  return Math.floor(Math.pow(level + 1, b.treasury.upgradeCostExp) * b.treasury.upgradeCostScale);
}

export function autonomyCost(t: number, b: Balance): number {
  return Math.floor(Math.pow(t + 1, b.phase3.autonomyCostExp) * b.phase3.autonomyCostScale);
}

export function tourneyCost(s: GameState, b: Balance): number {
  if (s.strategy.fixedCost > 0) return s.strategy.fixedCost;
  return b.strategy.tourneyBaseCost + b.strategy.tourneyCostPerStrategy * (s.strategy.unlocked - 1);
}

export function opsCapacity(s: GameState, b: Balance): number {
  return s.storage * b.compute.opsPerStorage;
}
