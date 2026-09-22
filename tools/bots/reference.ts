import { dispatch, type Balance, type GameState } from '../../src/sim';
import { demandConstant, optimalPrice, robotCost } from '../../src/sim/formulas';
import type { Bot } from './types';
import { setPrice, ticksPerSecond } from './util';

/**
 * Referenz-Bot nach Anhang C: nur das Kernmodell, keine Projekte.
 * - 5 Klicks/s, bis 5 Roboter stehen
 * - jede Sekunde Preis = price*; bei leerem Teilelager: Lager in 30 s abverkaufen
 * - Roboter/Werbung nur, wenn danach noch 1,3 × Teilepreis übrig bleibt
 * - Werbung, sobald robots/8 ≥ adLevel und bezahlbar; sonst Roboter (Werbung blockiert keine Roboterkäufe)
 */
export function referenceBot(): Bot {
  return {
    name: 'referenz',
    act(s: GameState, b: Balance) {
      const tps = ticksPerSecond(b);
      const clicking = s.robots < 5;
      if (clicking && s.tick % (tps / 5) === 0) dispatch(s, b, { type: 'makeCar' });
      if (s.tick % tps !== 0) return;

      const rate = s.robotBoost * s.robots + (clicking ? 5 : 0);
      if (s.parts < Math.max(50, rate * 10)) dispatch(s, b, { type: 'buyParts' });

      const K = demandConstant(s, b);
      const P = s.parts >= 1 ? rate : s.stock / 30;
      if (P > 0) setPrice(s, b, optimalPrice(P, K, b));

      const reserve = 1.3 * s.partsCost;
      const wantAd = s.adLevel <= s.robots / 8;
      if (wantAd && s.money - s.adCost >= reserve) dispatch(s, b, { type: 'buyAd' });
      else if (s.money - robotCost(s.robots, b) >= reserve) dispatch(s, b, { type: 'buyRobot' });
    },
  };
}
