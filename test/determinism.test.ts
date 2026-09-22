import { describe, expect, it } from 'vitest';
import { createState, defaultBalance as b, dispatch, fastTick } from '../src/sim';
import { rand } from '../src/sim/rng';
import { greedyBot } from '../tools/bots/greedy';
import { run } from '../tools/run';

describe('Determinismus', () => {
  it('PRNG ist reproduzierbar und gleichverteilt', () => {
    const a = { rng: 42 };
    const c = { rng: 42 };
    const xs = Array.from({ length: 10_000 }, () => rand(a));
    expect(xs.slice(0, 5)).toEqual(Array.from({ length: 5 }, () => rand(c)));
    const mean = xs.reduce((x, y) => x + y, 0) / xs.length;
    expect(mean).toBeGreaterThan(0.48);
    expect(mean).toBeLessThan(0.52);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
  });

  it('gleicher Seed + gleiche Aktionen = gleicher Zustand', () => {
    const opts = { seed: 7, maxSeconds: 20 * 60, balance: b };
    const x = run({ ...opts, bot: greedyBot() }).state;
    const y = run({ ...opts, bot: greedyBot() }).state;
    expect(JSON.stringify(x)).toBe(JSON.stringify(y));
  });

  it('der Zustand ist JSON-serialisierbar (keine Funktionen, kein undefined)', () => {
    const s = createState(b, 1);
    for (let i = 0; i < 1000; i++) {
      dispatch(s, b, { type: 'makeCar' });
      fastTick(s, b);
    }
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
});
