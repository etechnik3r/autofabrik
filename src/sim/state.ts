import type { Balance } from './balance';

export const STATE_VERSION = 1;

export type Phase = 1 | 2 | 3;

/** Freischaltungen und Schalter. Alle beginnen mit false. */
export const FLAG_NAMES = [
  'robots', // Anlagen-Panel sichtbar (money ≥ 500 k∈)
  'compute', // Rechenzentrum und Projekte
  'ideas', // P05
  'lines', // P22
  'autoBuyAvailable', // P26
  'autoBuy', // Schalter
  'revenue', // P42
  'treasury', // P21
  'strategy', // P20
  'autoTourney', // P118
  'quantum', // P50
  'power', // P127
  'mining', // P41
  'trucks', // P43
  'smelters', // P44
  'gigas', // P45
  'fleet', // P126
  'momentum', // P125
  'fleetReboot', // P130
  'hazardShield', // P129
  'defense', // P131
  'ooda', // P120
  'integrity', // P121
  'streak', // P134
  'placeBonus', // P128
  'endgame', // Ende-Trigger erreicht
  'noDrift', // P148
  'credits', // Abspann
] as const;
export type Flag = (typeof FLAG_NAMES)[number];

export type ProjectStatus = 0 | 1 | 2; // verborgen | sichtbar | gekauft
export interface ProjectState {
  status: ProjectStatus;
  count: number; // wie oft gekauft
  shownAt: number; // Tick, zu dem es sichtbar wurde (für das Blinken)
}

export interface Message {
  tick: number;
  text: string;
}

export interface Prestige {
  market: number;
  ideas: number;
}

export type Risk = 'low' | 'med' | 'high';
export interface Position {
  name: string;
  price: number;
  qty: number;
}
export interface TreasuryState {
  bankroll: number;
  risk: Risk;
  gain: number; // Gewinnschwelle g
  level: number; // Engine-Upgrades
  positions: Position[];
  sellTimer: number;
  profit: number; // realisierter Gewinn seit Start
}

export interface TourneyResult {
  matrix: [number, number, number, number]; // aa, ab, ba, bb
  labels: [string, string];
  scores: number[]; // Index = Strategie
  chosen: number;
  beaten: number;
  place: number;
  reward: number;
}
export interface StrategyState {
  unlocked: number; // Anzahl verfügbarer Strategien (1..8)
  selected: number;
  boost: number; // insightBoost
  fixedCost: number; // 0 = dynamisch, sonst feste Turnierkosten (P119)
  autoTimer: number;
  runs: number;
  last: TourneyResult | null;
}

export interface QuantumState {
  chips: number;
  clock: number;
  last: number | null;
}

export type BuildingKind = 'truck' | 'smelter' | 'solar' | 'battery' | 'giga';
export interface IndustryState {
  ore: number;
  oreMined: number;
  trucks: number;
  smelters: number;
  solar: number;
  battery: number;
  gigas: number;
  gigaCost: number;
  bills: Record<BuildingKind, number>;
  gigaRate: number;
  unitRateMult: number;
  gfBoost: number;
  droneBoost: number;
}

export interface PowerState {
  stored: number;
  powMod: number;
  supply: number;
  demand: number;
}

export type FleetStatus = 'AKTIV' | 'SCHLAFEND' | 'ALLEIN' | 'LEERLAUF' | 'DESYNC' | 'KEINE ANTWORT';
export interface FleetState {
  slider: number; // 0 = nur Fahren, 200 = nur Rechnen
  giftBits: number;
  gifts: number; // unverteilte Rechenspenden
  totalGifts: number;
  boredom: number;
  disorder: number;
  entertainCost: number;
  status: FleetStatus;
}

export const ATTRS = ['speed', 'nav', 'rep', 'haz', 'fac', 'truck', 'smelt', 'def'] as const;
export type Attr = (typeof ATTRS)[number];
export interface SpaceState {
  ships: number;
  launched: number;
  found: number;
  autonomy: number;
  maxAutonomy: number;
  attrs: Record<Attr, number>;
  partialRep: number;
  partialHaz: number;
  forks: number;
  lostHazard: number;
  lostConflict: number;
  lostDrift: number;
  forksDestroyed: number;
  integrity: number;
  streakBonus: number;
  memorialCost: number; // P133
}

export interface ConflictState {
  active: boolean;
  L: number;
  R: number;
  L0: number;
  R0: number;
  unit: number;
  timer: number;
  rounds: number;
  wins: number;
  losses: number;
  draws: number;
  last: 'win' | 'loss' | 'draw' | null;
  name: string;
}

export interface EndState {
  choice: 'none' | 'accept' | 'reject';
  timer: number; // Ticks seit letzter Demontagestufe
}

export interface Stats {
  producedAcc: number;
  soldAcc: number;
  incomeAcc: number;
  carsPerSec: number;
  soldPerSec: number;
  incomeBuf: number[];
  soldBuf: number[];
  secTimer: number;
}

export interface GameState {
  version: number;
  seed: number;
  rng: number;
  tick: number;
  phase: Phase;
  flags: Record<Flag, boolean>;

  // Phase 1 (flach wie in der Spec)
  cars: number;
  stock: number;
  pool: number;
  parts: number;
  money: number;
  price: number;
  partsPerDelivery: number;
  partsCost: number;
  partsBasePrice: number;
  partsTimer: number;
  partsCounter: number;
  deliveries: number;
  robots: number;
  robotBoost: number;
  lines: number;
  lineBoost: number;
  adLevel: number;
  adCost: number;
  adEffect: number;
  demandBoost: number;
  demand: number;
  lobbyCost: number;

  // Rechenzentrum
  rep: number;
  nextRep: number;
  fibA: number;
  fibB: number;
  cores: number;
  storage: number;
  stdOps: number;
  tempOps: number;
  tempTimer: number;
  tempDecay: number;
  ops: number;
  ideas: number;
  ideaSpeed: number;
  ideaCounter: number;
  insight: number;

  treasury: TreasuryState;
  strategy: StrategyState;
  quantum: QuantumState;
  industry: IndustryState;
  power: PowerState;
  fleet: FleetState;
  space: SpaceState;
  conflict: ConflictState;
  end: EndState;

  projects: Record<string, ProjectState>;
  stats: Stats;
  messages: Message[];
  nextMilestone: number;
  prestige: Prestige;
}

function flags(): Record<Flag, boolean> {
  return Object.fromEntries(FLAG_NAMES.map((f) => [f, false])) as Record<Flag, boolean>;
}

export function createState(b: Balance, seed: number, prestige: Prestige = { market: 0, ideas: 0 }): GameState {
  const p1 = b.phase1;
  return {
    version: STATE_VERSION,
    seed,
    rng: seed | 0,
    tick: 0,
    phase: 1,
    flags: flags(),

    cars: 0,
    stock: 0,
    pool: 0,
    parts: p1.startParts,
    money: p1.startMoney,
    price: p1.startPrice,
    partsPerDelivery: p1.partsPerDelivery,
    partsCost: p1.partsBasePrice,
    partsBasePrice: p1.partsBasePrice,
    partsTimer: 0,
    partsCounter: 0,
    deliveries: 0,
    robots: 0,
    robotBoost: 1,
    lines: 0,
    lineBoost: 1,
    adLevel: 1,
    adCost: p1.adStartCost,
    adEffect: 1,
    demandBoost: 1,
    demand: 0,
    lobbyCost: 100_000_000,

    rep: b.reputation.start,
    nextRep: b.reputation.firstThreshold,
    fibA: b.reputation.fibA,
    fibB: b.reputation.fibB,
    cores: b.compute.startCores,
    storage: b.compute.startStorage,
    stdOps: 0,
    tempOps: 0,
    tempTimer: 0,
    tempDecay: 0,
    ops: 0,
    ideas: 0,
    ideaSpeed: 1,
    ideaCounter: 0,
    insight: 0,

    treasury: {
      bankroll: 0,
      risk: 'low',
      gain: b.treasury.gainThresholdStart,
      level: 0,
      positions: [],
      sellTimer: 0,
      profit: 0,
    },
    strategy: { unlocked: 1, selected: 0, boost: 1, fixedCost: 0, autoTimer: 0, runs: 0, last: null },
    quantum: { chips: 0, clock: 0, last: null },
    industry: {
      ore: b.phase2.oreEarth,
      oreMined: 0,
      trucks: 0,
      smelters: 0,
      solar: 0,
      battery: 0,
      gigas: 0,
      gigaCost: b.phase2.gigaFirstCost,
      bills: { truck: 0, smelter: 0, solar: 0, battery: 0, giga: 0 },
      gigaRate: b.phase2.gigaRate,
      unitRateMult: 1,
      gfBoost: 1,
      droneBoost: 1,
    },
    power: { stored: 0, powMod: 0, supply: 0, demand: 0 },
    fleet: {
      slider: 100,
      giftBits: 0,
      gifts: 0,
      totalGifts: 0,
      boredom: 0,
      disorder: 0,
      entertainCost: b.phase2.entertainCost,
      status: 'SCHLAFEND',
    },
    space: {
      ships: 0,
      launched: 0,
      found: 0,
      autonomy: 0,
      maxAutonomy: b.phase3.maxAutonomyStart,
      attrs: { speed: 0, nav: 0, rep: 0, haz: 0, fac: 0, truck: 0, smelt: 0, def: 0 },
      partialRep: 0,
      partialHaz: 0,
      forks: 0,
      lostHazard: 0,
      lostConflict: 0,
      lostDrift: 0,
      forksDestroyed: 0,
      integrity: 0,
      streakBonus: 0,
      memorialCost: 50_000,
    },
    conflict: { active: false, L: 0, R: 0, L0: 0, R0: 0, unit: 1, timer: 0, rounds: 0, wins: 0, losses: 0, draws: 0, last: null, name: '' },
    end: { choice: 'none', timer: 0 },

    projects: {},
    stats: {
      producedAcc: 0,
      soldAcc: 0,
      incomeAcc: 0,
      carsPerSec: 0,
      soldPerSec: 0,
      incomeBuf: [],
      soldBuf: [],
      secTimer: 0,
    },
    messages: [{ tick: 0, text: 'Produktions-KI online. Erster Auftrag: Autos montieren und verkaufen.' }],
    nextMilestone: 0,
    prestige: { ...prestige },
  };
}

/** Spielzeit in Sekunden. */
export function playSeconds(s: GameState, b: Balance): number {
  return (s.tick * b.tick.fastMs) / 1000;
}

/** Ersetzt den Inhalt eines Zustandsobjekts in place (Prestige-Reset, Import). Referenzen bleiben gültig. */
export function replaceState(target: GameState, source: GameState): void {
  for (const k of Object.keys(target)) delete (target as unknown as Record<string, unknown>)[k];
  Object.assign(target, source);
}
