import { describe, expect, it } from 'vitest';
import { defaultBalance as b, createState } from '../src/sim';
import { gigaStepFactor, unitCost } from '../src/sim/buildings';
import { autonomyCost, ideaSpeed, optimalPrice, robotCost, treasuryUpgradeCost } from '../src/sim/formulas';
import { checkReputation } from '../src/sim/phase1';

describe('Formeln aus der Spec', () => {
  it('Montageroboter-Kosten (3.3)', () => {
    expect(robotCost(0, b)).toBe(500);
    expect(robotCost(1, b)).toBeCloseTo(610, 6);
    expect(robotCost(10, b)).toBeCloseTo(759.4, 1);
    expect(robotCost(50, b) / 1000).toBeCloseTo(12.2, 1); // 12,2 Mio. €
    expect(robotCost(100, b) / 1e6).toBeCloseTo(1.38, 2); // 1,38 Mrd. €
  });

  it('Reputationsschwellen folgen Fibonacci (3.7)', () => {
    const s = createState(b, 1);
    const thresholds: number[] = [];
    for (let i = 0; i < 9; i++) {
      thresholds.push(s.nextRep);
      s.cars = s.nextRep;
      checkReputation(s, b);
    }
    expect(thresholds).toEqual([3000, 5000, 8000, 13000, 21000, 34000, 55000, 89000, 144000]);
    expect(s.rep).toBe(b.reputation.start + 9);
  });

  it('Ideengeschwindigkeit (4.3)', () => {
    expect(ideaSpeed(1)).toBe(1);
    expect(ideaSpeed(2)).toBeCloseTo(1.65, 2);
    expect(ideaSpeed(5)).toBeCloseTo(8.11, 2);
    expect(ideaSpeed(10)).toBeCloseTo(21.6, 1);
    expect(ideaSpeed(20)).toBeCloseTo(54.1, 1);
  });

  it('Treasury-Upgradekosten (5.1)', () => {
    expect([0, 1, 2, 3].map((l) => treasuryUpgradeCost(l, b))).toEqual([100, 658, 1981, 4330]);
  });

  it('Autonomiekosten (7.1)', () => {
    expect([0, 1, 2, 3, 4].map((t) => autonomyCost(t, b))).toEqual([200, 554, 1005, 1534, 2130]);
  });

  it('Optimaler Preis: P = 10 Autos/s, K = 80 → ca. 8 k€ (3.5)', () => {
    expect(optimalPrice(10, 80, b)).toBeCloseTo(8, 0);
  });

  it('Gebäudekosten und Gigafactory-Stufen (6.2)', () => {
    expect(unitCost('truck', 0, b)).toBe(1e6);
    expect(unitCost('solar', 0, b)).toBe(1e7);
    expect(unitCost('battery', 0, b)).toBe(1e6);
    expect([1, 7, 8, 12, 13, 19, 20, 38, 39, 78, 79, 500].map((n) => gigaStepFactor(n, b))).toEqual([
      10, 4, 2, 2, 1.5, 1.5, 1.25, 1.25, 1.15, 1.15, 1.1, 1.1,
    ]);
  });
});
