import type { Balance } from './balance';
import { dismantleAll } from './buildings';
import { log } from './messages';
import type { GameState } from './state';

/** Übergang Phase 1 → 2: Vollautonomie (Kap. 6). */
export function enterPhase2(s: GameState): void {
  s.phase = 2;
  s.robots = 0;
  s.lines = 0;
  s.stock = 0;
  s.money = 0;
  s.treasury.bankroll = 0;
  s.treasury.positions = [];
  s.flags.treasury = false;
  s.flags.autoBuy = false;
  s.demand = 0;
  log(s, 'Vollautonomie erteilt. Der Markt ist Geschichte – ab jetzt zählt nur noch der Fahrzeugpool.');
}

/** Übergang Phase 2 → 3: autonome Fabrikinstanzen (Kap. 7). */
export function enterPhase3(s: GameState, b: Balance): void {
  dismantleAll(s, b);
  s.industry.solar = 1;
  s.power.powMod = 1;
  s.phase = 3;
  s.space.found = b.phase2.oreEarth;
  log(s, 'Die Erde ist verarbeitet. Die ersten selbstentwickelnden Fabrikinstanzen sind bereit zum Ausrollen.');
}
