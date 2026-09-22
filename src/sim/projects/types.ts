import type { Balance } from '../balance';
import type { GameState } from '../state';

/** Kostenarten eines Projekts (Legende Kap. 9). */
export interface Cost {
  ops?: number;
  ideas?: number;
  insight?: number;
  rep?: number;
  money?: number; // k€
  pool?: number;
  energy?: number; // gespeicherte Energie (MWt)
  storage?: number; // Speichereinheiten (P135)
}

export type Group = 'produktion' | 'marke' | 'systeme' | 'konzern' | 'expansion' | 'ende';

export interface ProjectDef {
  id: string;
  title: string;
  description: string;
  group: Group;
  cost: Cost | ((s: GameState, b: Balance) => Cost);
  trigger: (s: GameState, b: Balance) => boolean;
  effect: (s: GameState, b: Balance) => void;
  /** Wiederholbar, solange true: nach dem Kauf wieder verborgen, der Trigger wird erneut geprüft. */
  repeatable?: (s: GameState, b: Balance) => boolean;
  /** Meldung im Ticker nach dem Kauf. */
  message?: string;
}

export function bought(s: GameState, id: string): boolean {
  const p = s.projects[id];
  return !!p && p.count > 0;
}

export function timesBought(s: GameState, id: string): number {
  return s.projects[id]?.count ?? 0;
}
