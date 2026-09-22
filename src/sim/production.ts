import type { GameState } from './state';

/** Produktionsfunktion (2.4): verbraucht Teilesätze, erzeugt Autos. */
export function produce(s: GameState, k: number): void {
  k = Math.min(k, s.parts);
  if (!(k > 0)) return;
  s.cars += k;
  s.parts -= k;
  s.pool += k;
  if (s.phase === 1) s.stock += k;
  s.stats.producedAcc += k;
}
