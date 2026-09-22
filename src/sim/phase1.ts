import type { Balance } from './balance';
import { demandConstant } from './formulas';
import { log } from './messages';
import { rand } from './rng';
import type { GameState } from './state';

/** Teilebestellung (3.4). */
export function buyParts(s: GameState, b: Balance): boolean {
  if (s.money < s.partsCost) return false;
  s.money -= s.partsCost;
  s.parts += s.partsPerDelivery;
  s.partsBasePrice += b.phase1.partsBaseIncreasePerBuy;
  s.partsTimer = 0;
  s.deliveries++;
  return true;
}

/** Preisschwankung, jeder Slow-Tick (3.4). */
export function fluctuatePartsPrice(s: GameState, b: Balance): void {
  const p = b.phase1;
  s.partsTimer++;
  if (s.partsTimer > p.partsBaseDecayTicks && s.partsBasePrice > p.partsBaseFloor) {
    s.partsBasePrice *= 1 - p.partsBaseDecay;
    s.partsTimer = 0;
  }
  if (rand(s) < p.partsPriceUpdateChance) {
    s.partsCounter++;
    s.partsCost = Math.ceil(s.partsBasePrice + p.partsPriceAmplitude * Math.sin(s.partsCounter));
  }
}

/** Nachfrage, jeder Fast-Tick (3.5). */
export function updateDemand(s: GameState, b: Balance): void {
  s.demand = demandConstant(s, b) / s.price;
}

/** Verkauf, jeder Slow-Tick (3.5). */
export function sell(s: GameState, b: Balance): void {
  if (rand(s) < s.demand / 100) {
    const q = Math.min(Math.floor(b.phase1.salesFactor * Math.pow(s.demand, b.phase1.salesExponent)), s.stock);
    if (q <= 0) return;
    s.stock -= q;
    s.money += q * s.price;
    s.stats.incomeAcc += q * s.price;
    s.stats.soldAcc += q;
  }
}

/** Einmal pro Sekunde: Raten und Umsatz-Ringpuffer (3.6). */
export function updateStats(s: GameState): void {
  const st = s.stats;
  st.carsPerSec = st.producedAcc;
  st.producedAcc = 0;
  st.incomeBuf.push(st.incomeAcc);
  st.soldBuf.push(st.soldAcc);
  if (st.incomeBuf.length > 10) st.incomeBuf.shift();
  if (st.soldBuf.length > 10) st.soldBuf.shift();
  st.soldPerSec = st.soldBuf.reduce((a, x) => a + x, 0) / st.soldBuf.length;
  st.incomeAcc = 0;
  st.soldAcc = 0;
}

export function avgIncome(s: GameState): number {
  const buf = s.stats.incomeBuf;
  return buf.length ? buf.reduce((a, x) => a + x, 0) / buf.length : 0;
}

/** Reputation über Fibonacci-Meilensteine (3.7). */
export function checkReputation(s: GameState, b: Balance): void {
  if (s.cars >= s.nextRep) {
    s.rep++;
    const n = s.fibA + s.fibB;
    s.nextRep = b.reputation.scale * n;
    s.fibA = s.fibB;
    s.fibB = n;
    log(s, `Der Aufsichtsrat ist zufrieden. Ansehen +1 (jetzt ${s.rep}).`);
  }
}
