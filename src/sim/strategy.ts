import type { Balance } from './balance';
import { spendOps } from './compute';
import { tourneyCost } from './formulas';
import { log } from './messages';
import { rand } from './rng';
import type { GameState, TourneyResult } from './state';

// Namen der Verhaltensarchetypen im Turnier, an typische Automarken-Strategien angelehnt.
// Die Logik dahinter (move()) bleibt unverändert, es ändert sich nur die Beschriftung.
export const STRATEGY_NAMES = [
  'BAUCHGEFÜHL', // vorher ZUFALL
  'HARDLINER', // vorher IMMER A
  'WEICHSPÜLER', // vorher IMMER B
  'MARKTBEHERRSCHER', // vorher GIERIG
  'KULANZ', // vorher GROSSZÜGIG
  'SICHERHEITSSTRATEGIE', // vorher MINIMAX
  'SPIEGELTAKTIK', // vorher WIE DU MIR
  'ÜBERHOLMANÖVER', // vorher SCHLAG DEN LETZTEN
] as const;

const ACTION_PAIRS: [string, string][] = [
  ['Preis senken', 'Preis halten'],
  ['investieren', 'sparen'],
  ['Kooperation', 'Alleingang'],
  ['Rabattaktion', 'Premiumlinie'],
  ['Elektro', 'Verbrenner'],
  ['Leasing', 'Barverkauf'],
  ['expandieren', 'konsolidieren'],
];

type Move = 0 | 1; // A | B
type Matrix = [number, number, number, number];

/** Auszahlung für den Spieler, der `me` spielt, wenn der Gegner `other` spielt. */
function payoff(m: Matrix, me: Move, other: Move): number {
  return m[me * 2 + other];
}

function bestIndex(m: Matrix): number {
  let best = 0;
  for (let i = 1; i < 4; i++) if (m[i] > m[best]) best = i;
  return best + 1; // 1..4 = aa, ab, ba, bb
}

function move(strategy: number, m: Matrix, oppLast: Move | null, s: GameState): Move {
  const best = bestIndex(m);
  switch (strategy) {
    case 0:
      return rand(s) < 0.5 ? 0 : 1;
    case 1:
      return 0;
    case 2:
      return 1;
    case 3:
      return best <= 2 ? 0 : 1;
    case 4:
      return best === 1 || best === 3 ? 0 : 1;
    case 5:
      return best === 1 || best === 3 ? 1 : 0;
    case 6:
      return oppLast ?? 0;
    case 7:
      if (oppLast === null) return 0;
      return oppLast === 0 ? (m[0] > m[2] ? 0 : 1) : m[1] > m[3] ? 0 : 1;
    default:
      return 0;
  }
}

/** Round-Robin aller freigeschalteten Strategien (5.2). */
export function playTourney(s: GameState, b: Balance): TourneyResult {
  const n = s.strategy.unlocked;
  const matrix = [0, 0, 0, 0].map(() => Math.max(1, Math.ceil(rand(s) * b.strategy.matrixMax))) as Matrix;
  const labels = ACTION_PAIRS[Math.floor(rand(s) * ACTION_PAIRS.length)];
  const scores = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let lastI: Move | null = null;
      let lastJ: Move | null = null;
      for (let t = 0; t < b.strategy.turnsPerMatch; t++) {
        const mi = move(i, matrix, lastJ, s);
        const mj = move(j, matrix, lastI, s);
        scores[i] += payoff(matrix, mi, mj);
        lastI = mi;
        lastJ = mj;
      }
    }
  }
  const chosen = Math.min(s.strategy.selected, n - 1);
  const beaten = scores.filter((x) => x < scores[chosen]).length;
  const place = scores.filter((x) => x > scores[chosen]).length + 1;
  let reward = scores[chosen] * s.strategy.boost * Math.max(1, beaten);
  if (s.flags.placeBonus && place <= b.strategy.placeBonus.length) reward += b.strategy.placeBonus[place - 1];
  return { matrix, labels, scores, chosen, beaten, place, reward };
}

export function canRunTourney(s: GameState, b: Balance): boolean {
  return s.flags.strategy && s.ops >= tourneyCost(s, b);
}

export function runTourney(s: GameState, b: Balance): boolean {
  if (!canRunTourney(s, b)) return false;
  spendOps(s, tourneyCost(s, b));
  const r = playTourney(s, b);
  s.insight += r.reward;
  s.strategy.last = r;
  s.strategy.runs++;
  return true;
}

/** Auto-Turnier (P118): alle 30 s. */
export function autoTourney(s: GameState, b: Balance): void {
  s.strategy.autoTimer++;
  if (s.strategy.autoTimer >= (b.strategy.autoTourneySeconds * 1000) / b.tick.fastMs) {
    s.strategy.autoTimer = 0;
    runTourney(s, b);
  }
}

export function unlockStrategy(s: GameState): void {
  s.strategy.unlocked = Math.min(STRATEGY_NAMES.length, s.strategy.unlocked + 1);
  log(s, `Neue Strategie verfügbar: ${STRATEGY_NAMES[s.strategy.unlocked - 1]}.`);
}
