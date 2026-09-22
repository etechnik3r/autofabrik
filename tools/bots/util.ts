import { dispatch, type Balance, type GameState } from '../../src/sim';

/** Setzt den Preis über ±1-Aktionen (gleicher Weg wie der Spieler). */
export function setPrice(s: GameState, b: Balance, target: number): void {
  const t = Math.max(b.phase1.priceMin, Math.round(target));
  let guard = 10_000;
  while (s.price < t && guard-- > 0 && dispatch(s, b, { type: 'price', delta: 1 }));
  while (s.price > t && guard-- > 0 && dispatch(s, b, { type: 'price', delta: -1 }));
}

export function ticksPerSecond(b: Balance): number {
  return 1000 / b.tick.fastMs;
}
