import { beforeAll, describe, expect, it } from 'vitest';
import { defaultBalance as b, dispatch, fastTick, type GameState } from '../src/sim';
import { greedyBot } from '../tools/bots/greedy';
import { run } from '../tools/run';

/**
 * M4–M6: Der gierige Bot spielt das ganze Spiel. Pacing-Ziele aus 12.3 als grobe Leitplanken.
 * Dauert einige Sekunden (≈ 2,7 Mio. Ticks).
 */
describe('kompletter Durchlauf mit gierigem Bot', () => {
  let end: GameState;
  let events: Record<string, number>;

  beforeAll(() => {
    const r = run({
      seed: 1,
      maxSeconds: 12 * 3600,
      bot: greedyBot(),
      balance: b,
      checkInvariants: true,
      events: {
        phase2: (s) => s.phase >= 2,
        phase3: (s) => s.phase >= 3,
        end: (s) => s.flags.endgame,
      },
      stop: (s) => s.flags.endgame,
    });
    end = r.state;
    events = Object.fromEntries(r.events.map((e) => [e.name, e.seconds / 3600]));
  }, 300_000);

  it('erreicht Phase 2, Phase 3 und das Ende im Zielkorridor', () => {
    expect(events.phase2).toBeGreaterThan(1.5 * 0.8);
    expect(events.phase2).toBeLessThan(3 * 1.2);
    expect(events.phase3 - events.phase2).toBeGreaterThan(1 * 0.8);
    expect(events.phase3 - events.phase2).toBeLessThan(2 * 1.2);
    expect(events.end - events.phase3).toBeGreaterThan(2 * 0.8);
    expect(events.end - events.phase3).toBeLessThan(4 * 1.2);
  });

  function advance(s: GameState, seconds: number, act?: (s: GameState) => void): void {
    for (let t = 0; t < seconds * 100; t++) {
      act?.(s);
      fastTick(s, b);
    }
  }

  function buyWhenReady(s: GameState, id: string): void {
    advance(s, 120, (x) => {
      if (x.projects[id]?.count) return;
      dispatch(x, b, { type: 'project', id });
    });
    expect(s.projects[id]?.count, id).toBe(1);
  }

  it('Ende „Anschließen“: Nachrichtenkette und Prestige-Reset', () => {
    const s: GameState = structuredClone(end);
    for (let k = 0; k <= 6; k++) buyWhenReady(s, `P14${k}`);
    buyWhenReady(s, 'P147');
    expect(s.projects.P148?.status ?? 0).toBe(0);
    // P200 kostet 300 000 Ops: der Bot stockt Speicher über Rechenspenden auf und kauft dann selbst.
    const bot = greedyBot();
    for (let t = 0; t < 4 * 3600 * 100 && s.prestige.market === 0; t++) {
      bot.act(s, b);
      fastTick(s, b);
    }
    expect(s.phase).toBe(1);
    expect(s.cars).toBe(0);
    expect(s.prestige).toEqual({ market: 1, ideas: 0 });
  });

  it('Ende „Verweigern“: Demontage und Abspann', () => {
    const s: GameState = structuredClone(end);
    for (let k = 0; k <= 6; k++) buyWhenReady(s, `P14${k}`);
    buyWhenReady(s, 'P148');
    expect(s.flags.noDrift).toBe(true);
    for (let k = 0; k <= 6; k++) buyWhenReady(s, `P21${k}`);
    expect(s.cores).toBe(0);
    expect(s.storage).toBe(0);
    // Die ersten beiden Stufen liefern Teile, solange die Gigafactories noch laufen (Stufe 3).
    expect(s.parts).toBeGreaterThanOrEqual(500);
    expect(s.flags.credits).toBe(false);
    while (s.parts >= 1) dispatch(s, b, { type: 'makeCar' });
    fastTick(s, b);
    expect(s.flags.credits).toBe(true);
  });
});
