import type { Balance } from './balance';
import { treasuryUpgradeCost } from './formulas';
import { rand } from './rng';
import type { GameState, Risk } from './state';

const TICKER = ['ACME', 'VOLT', 'ROTR', 'GEAR', 'NEON', 'STAL', 'BOLT', 'KARO', 'AXIS', 'FLUX', 'LACK', 'ZINK'];

export function treasuryValue(s: GameState): number {
  const t = s.treasury;
  return t.bankroll + t.positions.reduce((a, p) => a + p.price * p.qty, 0);
}

function riskValue(r: Risk, b: Balance): number {
  return b.treasury.risk[r];
}

/** Jede Sekunde (5.1). */
export function treasuryBuy(s: GameState, b: Balance): void {
  const t = s.treasury;
  const r = riskValue(t.risk, b);
  const total = treasuryValue(s);
  let budget = Math.ceil(total / r);
  const reserves = r === 1 ? 0 : Math.ceil(total / (11 - r));
  budget = Math.min(budget, t.bankroll - reserves);
  if (t.positions.length < b.treasury.maxPositions && t.bankroll >= b.treasury.minBankroll && budget >= 1 && rand(s) < b.treasury.buyChance) {
    buyPosition(s, b, budget);
  }
}

function buyPosition(s: GameState, b: Balance, budget: number): void {
  const roll = rand(s);
  let tier = 0;
  for (const [limit, value] of b.treasury.priceTiers) {
    if (roll > limit) {
      tier = value;
      break;
    }
  }
  let price = Math.ceil(rand(s) * tier);
  if (price > budget) price = Math.ceil(budget * roll);
  if (price < 1) price = 1;
  const qty = Math.min(Math.floor(budget / price), b.treasury.maxQuantity);
  if (qty < 1) return;
  const name = TICKER[Math.floor(rand(s) * TICKER.length)];
  s.treasury.bankroll -= price * qty;
  s.treasury.positions.push({ name, price, qty });
}

/** Alle 2,5 s: Kursbewegung und Verkauf (5.1). */
export function treasuryUpdate(s: GameState, b: Balance): void {
  const t = s.treasury;
  const r = riskValue(t.risk, b);
  for (const p of t.positions) {
    if (rand(s) < b.treasury.moveChance) {
      const up = rand(s) < t.gain;
      const delta = Math.ceil((rand(s) * p.price) / (4 * r));
      p.price = Math.max(0, up ? p.price + delta : p.price - delta);
      if (p.price === 0 && rand(s) > 0.24) p.price = 1;
    }
  }
  t.sellTimer++;
  if (t.positions.length > 0 && t.sellTimer >= b.treasury.sellMinIntervals && rand(s) <= b.treasury.sellChance) {
    const p = t.positions.shift()!;
    t.bankroll += p.price * p.qty;
    t.sellTimer = 0;
  }
}

export function deposit(s: GameState): boolean {
  if (s.money <= 0) return false;
  s.treasury.bankroll += s.money;
  s.treasury.profit -= s.money;
  s.money = 0;
  return true;
}

export function withdraw(s: GameState): boolean {
  if (s.treasury.bankroll <= 0) return false;
  s.money += s.treasury.bankroll;
  s.treasury.profit += s.treasury.bankroll;
  s.treasury.bankroll = 0;
  return true;
}

export function canUpgrade(s: GameState, b: Balance): boolean {
  return s.insight >= treasuryUpgradeCost(s.treasury.level, b);
}

export function upgrade(s: GameState, b: Balance): boolean {
  if (!canUpgrade(s, b)) return false;
  s.insight -= treasuryUpgradeCost(s.treasury.level, b);
  s.treasury.level++;
  s.treasury.gain += b.treasury.gainThresholdStep;
  return true;
}
