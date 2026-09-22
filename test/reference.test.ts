import { describe, expect, it } from 'vitest';
import { defaultBalance } from '../src/sim';
import { referenceBot } from '../tools/bots/reference';
import { run } from '../tools/run';

/** Anhang C: Kernmodell ohne Projekte, Mittelwerte der drei Referenz-Seeds. */
const REFERENCE_MIN: Record<string, number> = {
  '2000': (3.9 + 4.3 + 4.3) / 3,
  '10000': (9.2 + 9.9 + 10.2) / 3,
  '100000': (43.2 + 44.2 + 44.4) / 3,
};

describe('M1: Referenzsimulation Anhang C (±10 %)', () => {
  for (const seed of [1, 2, 3]) {
    it(`Seed ${seed}`, () => {
      const r = run({
        seed,
        maxSeconds: 50 * 60,
        bot: referenceBot(),
        balance: defaultBalance,
        checkInvariants: true,
        events: Object.fromEntries(Object.keys(REFERENCE_MIN).map((k) => [k, (s) => s.cars >= Number(k)])),
        stop: (s) => s.cars >= 100_000,
      });
      for (const [name, ref] of Object.entries(REFERENCE_MIN)) {
        const e = r.events.find((x) => x.name === name);
        expect(e, `Ereignis ${name}`).toBeDefined();
        expect(e!.seconds / 60).toBeGreaterThan(ref * 0.9);
        expect(e!.seconds / 60).toBeLessThan(ref * 1.1);
      }
    });
  }
});
