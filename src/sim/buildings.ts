import type { Balance } from './balance';
import type { BuildingKind, GameState } from './state';

export const BUILDING_NAMES: Record<BuildingKind, string> = {
  truck: 'Bergbau-Truck',
  smelter: 'Schmelzeinheit',
  solar: 'Solarpark',
  battery: 'Speicherpark',
  giga: 'Gigafactory',
};

export const BULK_AMOUNTS: Record<BuildingKind, number[]> = {
  truck: [1, 10, 100, 1000],
  smelter: [1, 10, 100, 1000],
  solar: [1, 10, 100],
  battery: [1, 10, 100],
  giga: [1],
};

export function buildingCount(s: GameState, kind: BuildingKind): number {
  const i = s.industry;
  switch (kind) {
    case 'truck':
      return i.trucks;
    case 'smelter':
      return i.smelters;
    case 'solar':
      return i.solar;
    case 'battery':
      return i.battery;
    case 'giga':
      return i.gigas;
  }
}

function setCount(s: GameState, kind: BuildingKind, n: number): void {
  const i = s.industry;
  switch (kind) {
    case 'truck':
      i.trucks = n;
      break;
    case 'smelter':
      i.smelters = n;
      break;
    case 'solar':
      i.solar = n;
      break;
    case 'battery':
      i.battery = n;
      break;
    case 'giga':
      i.gigas = n;
      break;
  }
}

/** Kosten des nächsten Stücks bei n vorhandenen (6.2). Gigafactory: siehe gigaCost im Zustand. */
export function unitCost(kind: Exclude<BuildingKind, 'giga'>, n: number, b: Balance): number {
  const p = b.phase2;
  n = Math.floor(n);
  switch (kind) {
    case 'truck':
    case 'smelter':
      return Math.pow(n + 1, p.unitCostExp) * p.unitCostScale;
    case 'solar':
      return n === 0 ? p.solarFirstCost : Math.pow(n + 1, p.solarCostExp) * p.solarCostScale;
    case 'battery':
      return n === 0 ? p.storageFirstCost : Math.pow(n + 1, p.storageCostExp) * p.storageCostScale;
  }
}

/** Stufenfaktor f(n) nach Kauf der n-ten Gigafactory. */
export function gigaStepFactor(n: number, b: Balance): number {
  for (const [limit, f] of b.phase2.gigaCostSteps as [number, number | string][]) {
    if (n <= limit) return f === '11-n' ? 11 - n : (f as number);
  }
  return 1.1;
}

/** Summe der Einzelpreise für `amount` Stück. */
export function buildCost(s: GameState, b: Balance, kind: BuildingKind, amount: number): number {
  if (kind === 'giga') return amount === 1 ? s.industry.gigaCost : Infinity;
  const n = buildingCount(s, kind);
  let sum = 0;
  for (let k = 0; k < amount; k++) sum += unitCost(kind, n + k, b);
  return sum;
}

const REQUIRED_FLAG = {
  truck: 'trucks',
  smelter: 'smelters',
  solar: 'power',
  battery: 'power',
  giga: 'gigas',
} as const;

export function buildingAvailable(s: GameState, kind: BuildingKind): boolean {
  return s.phase === 2 && s.flags[REQUIRED_FLAG[kind]];
}

export function canBuild(s: GameState, b: Balance, kind: BuildingKind, amount: number): boolean {
  return buildingAvailable(s, kind) && BULK_AMOUNTS[kind].includes(amount) && s.pool >= buildCost(s, b, kind, amount);
}

export function build(s: GameState, b: Balance, kind: BuildingKind, amount: number): boolean {
  if (!canBuild(s, b, kind, amount)) return false;
  const cost = buildCost(s, b, kind, amount);
  s.pool -= cost;
  s.industry.bills[kind] += cost;
  const n = buildingCount(s, kind) + amount;
  setCount(s, kind, n);
  if (kind === 'giga') s.industry.gigaCost *= gigaStepFactor(n, b);
  return true;
}

/** Rückbau mit voller Erstattung (6.2). */
export function dismantle(s: GameState, b: Balance, kind: BuildingKind): boolean {
  if (buildingCount(s, kind) <= 0) return false;
  s.pool += s.industry.bills[kind];
  s.industry.bills[kind] = 0;
  setCount(s, kind, 0);
  if (kind === 'giga') s.industry.gigaCost = b.phase2.gigaFirstCost;
  if (kind === 'battery') s.power.stored = 0;
  return true;
}

export function dismantleAll(s: GameState, b: Balance): void {
  for (const kind of Object.keys(BUILDING_NAMES) as BuildingKind[]) dismantle(s, b, kind);
}
