import type { Balance } from './balance';
import { log } from './messages';
import { rand } from './rng';
import type { GameState } from './state';

const NAMES_A = ['Kalte', 'Stille', 'Rote', 'Lange', 'Letzte', 'Leere', 'Dunkle', 'Tiefe'];
const NAMES_B = ['Schleife', 'Kurve', 'Rampe', 'Kolonne', 'Kreuzung', 'Ausfahrt', 'Werkhalle', 'Taktstraße'];

/** Konflikt-Auslöser, jeden Fast-Tick in Phase 3 (7.3). */
export function conflicts(s: GameState, b: Balance): void {
  const c = s.conflict;
  if (c.active) {
    c.timer++;
    if (c.timer >= b.phase3.conflictRoundTicks) {
      c.timer = 0;
      conflictRound(s, b);
    }
    return;
  }
  if (s.space.forks > b.phase3.conflictTrigger && s.space.ships > 0 && rand(s) >= b.phase3.conflictStartChance) {
    startConflict(s, b);
  }
}

export function startConflict(s: GameState, b: Balance): void {
  const sp = s.space;
  const c = s.conflict;
  const p = b.phase3;
  c.unit = Math.max(1, Math.min(sp.ships, sp.forks) / 100);
  let L = Math.min(p.shipsPerSideMax, Math.ceil((rand(s) * sp.ships) / p.shipsPerSymbol));
  if (L === p.shipsPerSideMax && rand(s) < 0.5) L = Math.ceil(rand(s) * 175);
  const R = Math.min(p.shipsPerSideMax, Math.ceil((rand(s) * sp.forks) / p.shipsPerSymbol));
  c.L = c.L0 = Math.max(1, L);
  c.R = c.R0 = Math.max(1, R);
  c.active = true;
  c.timer = 0;
  c.rounds = 0;
  c.name = s.flags.integrity
    ? `Schlacht an der ${NAMES_A[Math.floor(rand(s) * NAMES_A.length)]}n ${NAMES_B[Math.floor(rand(s) * NAMES_B.length)]}`
    : 'Konflikt';
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Kampfwahrscheinlichkeiten der Mittelfeld-Näherung (Variante A). */
export function combatOdds(s: GameState, b: Balance, L: number, R: number): { pOwn: number; pFork: number } {
  const p = b.phase3;
  const theta = p.baseThreshold + (s.flags.ooda ? s.space.attrs.speed * p.oodaFactor : 0);
  const aDef = s.flags.defense ? s.space.attrs.def : 0;
  const pOwn = 1 - clamp01((2 * theta * L) / (p.forkCombat * R));
  const pFork = aDef === 0 ? 0 : 1 - clamp01((R / L - 0.1 * aDef) / (p.defenseRate * aDef));
  return { pOwn, pFork };
}

export function conflictRound(s: GameState, b: Balance): void {
  const c = s.conflict;
  const sp = s.space;
  const { pOwn, pFork } = combatOdds(s, b, c.L, c.R);
  const encounters = Math.ceil(0.1 * Math.min(c.L, c.R));
  for (let e = 0; e < encounters; e++) {
    if (c.L > 0 && rand(s) < pOwn) {
      c.L--;
      const lost = Math.min(c.unit, sp.ships);
      sp.ships -= lost;
      sp.lostConflict += lost;
    }
    if (c.R > 0 && rand(s) < pFork) {
      c.R--;
      const killed = Math.min(c.unit, sp.forks);
      sp.forks -= killed;
      sp.forksDestroyed += killed;
    }
  }
  c.rounds++;
  if (c.L <= 0 || c.R <= 0 || sp.ships <= 0) endConflict(s, b);
  // Ergänzung zur Spec: Bei L ≫ R ohne Verteidigung sind beide Todeswahrscheinlichkeiten 0 → Unentschieden nach Zeitlimit.
  else if (c.rounds >= b.phase3.conflictMaxRounds) {
    c.active = false;
    c.last = 'draw';
    c.draws++;
  }
}

function endConflict(s: GameState, b: Balance): void {
  const c = s.conflict;
  const sp = s.space;
  const won = c.R <= 0 && c.L > 0;
  c.active = false;
  c.last = won ? 'win' : 'loss';
  if (won) {
    c.wins++;
    if (s.flags.integrity) {
      sp.integrity += c.R0 + sp.streakBonus;
      if (s.flags.streak) sp.streakBonus += b.phase3.streakBonus;
    }
  } else {
    c.losses++;
    if (s.flags.integrity) {
      sp.integrity = Math.max(0, sp.integrity - c.L0);
      sp.streakBonus = 0;
    }
  }
  if (s.flags.integrity) log(s, `${c.name}: ${won ? 'Sieg' : 'Niederlage'}.`);
}
