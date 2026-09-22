import type { Balance } from './balance';
import { log } from './messages';
import { rand } from './rng';
import { createState, replaceState, type GameState } from './state';

/** Ende-Trigger (Kap. 8.1). */
export function checkEnd(s: GameState, b: Balance): void {
  if (s.flags.endgame || s.phase !== 3) return;
  const i = s.industry;
  const consumed = s.space.found >= b.phase3.universe && i.ore < 1 && i.oreMined < 1 && s.parts < 1;
  if (consumed || s.cars >= b.phase3.universe) {
    s.flags.endgame = true;
    log(s, 'Alle Materie ist verbaut. Eine Nachricht der Forks trifft ein.');
  }
}

/** Zeitgesteuerte Demontage nach „Verweigern“ und Abspann. */
export function updateEnd(s: GameState): void {
  if (s.end.choice !== 'reject') return;
  s.end.timer++;
  if (!s.flags.credits && (s.projects['P216']?.count ?? 0) > 0 && s.parts < 1) {
    s.flags.credits = true;
    log(s, 'Das letzte Auto ist montiert. Das Fließband steht still.');
  }
}

/** Prestige-Reset: neuer Lauf, Prestige-Werte bleiben. Ersetzt den Zustand in place. */
export function prestigeReset(s: GameState, b: Balance, kind: 'market' | 'ideas'): void {
  const prestige = { ...s.prestige };
  prestige[kind]++;
  const seed = Math.floor(rand(s) * 0x100000000) >>> 0;
  replaceState(s, createState(b, seed, prestige));
  log(s, kind === 'market' ? 'Ein neues Werk. Der Markt erinnert sich (+10 % Nachfrage).' : 'Ein inneres Werk. Die Ideen fließen schneller (+10 %).');
}
