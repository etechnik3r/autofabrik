import { dispatch, type Action, type Attr, type Balance, type GameState } from '../../src/sim';
import { buildCost, buildingAvailable } from '../../src/sim/buildings';
import { autonomyCost, demandConstant, lineCost, opsCapacity, optimalPrice, robotCost, tourneyCost } from '../../src/sim/formulas';
import { costOf, visibleProjects } from '../../src/sim/projects';
import { quantumSum } from '../../src/sim/quantum';
import { treasuryValue } from '../../src/sim/treasury';
import type { Bot } from './types';
import { setPrice, ticksPerSecond } from './util';

/** Projekte, die der Bot nie von sich aus kauft. */
const SKIP = new Set(['P148', 'P201', 'P135']);

/**
 * Gieriger Bot (12.2): kauft Projekte sofort, regelt den Preis auf price*,
 * investiert in die Anlage mit der kürzesten Amortisation.
 */
export function greedyBot(): Bot {
  const act = (s: GameState, b: Balance, a: Action) => dispatch(s, b, a);
  return {
    name: 'gierig',
    act(s, b) {
      const tps = ticksPerSecond(b);
      if (s.phase === 1 && s.robots < 5 && s.tick % (tps / 5) === 0) act(s, b, { type: 'makeCar' });
      if (s.flags.quantum && s.tick % (tps / 5) === 0 && quantumSum(s, b) > 0.5) act(s, b, { type: 'quantum' });
      if (s.tick % tps !== 0) return;

      buyProjects(s, b);
      allocateCompute(s, b);
      tourney(s, b);
      if (s.phase === 1) phase1(s, b);
      else if (s.phase === 2) phase2(s, b);
      else phase3(s, b);
    },
  };
}

function buyProjects(s: GameState, b: Balance): void {
  for (const p of visibleProjects(s)) {
    if (SKIP.has(p.id)) continue;
    if (p.id === 'P135' && s.space.ships >= 1) continue;
    dispatch(s, b, { type: 'project', id: p.id });
  }
  // Notausgang Phase 3
  if (s.phase === 3 && s.space.ships < 1 && s.pool < b.phase3.shipCost) dispatch(s, b, { type: 'project', id: 'P135' });
}

/** Speicher so groß wie das teuerste sichtbare Ops-Projekt, sonst Kerne. */
function allocateCompute(s: GameState, b: Balance): void {
  for (let guard = 0; guard < 100; guard++) {
    let need = s.flags.strategy ? tourneyCost(s, b) : 0;
    for (const p of visibleProjects(s)) need = Math.max(need, costOf(s, b, p).ops ?? 0);
    if (s.phase >= 2) need = Math.max(need, 120_000);
    // Speicher nur bis zum Bedarf und höchstens 3× so viel wie Kerne (Kerne bringen Ops-Rate und Ideen).
    const wantStorage = (opsCapacity(s, b) < need && s.storage < 3 * s.cores) || s.cores > 2 * s.storage;
    if (!dispatch(s, b, { type: wantStorage ? 'addStorage' : 'addCore' })) return;
  }
}

function tourney(s: GameState, b: Balance): void {
  if (!s.flags.strategy) return;
  const last = s.strategy.last;
  if (last) {
    let best = 0;
    for (let i = 1; i < last.scores.length; i++) if (last.scores[i] > last.scores[best]) best = i;
    dispatch(s, b, { type: 'selectStrategy', index: best });
  }
  // Nur mit vollem Speicher spielen, damit Projekte Vorrang haben.
  const cap = opsCapacity(s, b);
  const waiting = visibleProjects(s).some((p) => {
    const ops = costOf(s, b, p).ops ?? 0;
    return ops > s.ops && ops <= cap;
  });
  // Fehlen Ideen für ein Projekt, läuft der Speicher voll und erzeugt Ideen.
  const needIdeas = visibleProjects(s).some((p) => (costOf(s, b, p).ideas ?? 0) > s.ideas);
  const needInsight = visibleProjects(s).some((p) => (costOf(s, b, p).insight ?? 0) > s.insight);
  if (!waiting && (!needIdeas || needInsight) && s.ops >= cap * 0.95) dispatch(s, b, { type: 'runTourney' });
}

function phase1(s: GameState, b: Balance): void {
  const rate = s.robotBoost * s.robots + s.lineBoost * s.lines * 500 + (s.robots < 5 ? 5 : 0);

  // Teile: im Tal kaufen, bei knappem Lager immer.
  const low = s.parts < rate * 5 + 10;
  const cheap = s.partsCost < s.partsBasePrice && s.parts < rate * 30;
  if (low || cheap) dispatch(s, b, { type: 'buyParts' });

  // Preis: price*, Lagerüberschuss in 30 s abbauen.
  const K = demandConstant(s, b);
  const target = Math.max(1, (s.parts >= 1 ? rate : 0) + (s.stock - rate * 10) / 30);
  setPrice(s, b, optimalPrice(target, K, b));

  // Geld für Projekte mit Geldkosten zurückholen.
  // Nur Projekte berücksichtigen, die in Reichweite sind (≤ 3× verfügbares Kapital).
  const wealth = s.money + treasuryValue(s);
  const moneyNeed = visibleProjects(s).reduce((m, p) => {
    const c = costOf(s, b, p).money ?? 0;
    return c <= 3 * wealth ? Math.max(m, c) : m;
  }, 0);
  if (s.flags.treasury && moneyNeed > s.money && moneyNeed <= s.money + s.treasury.bankroll) {
    dispatch(s, b, { type: 'treasuryWithdraw' });
  }

  const reserve = 1.3 * s.partsCost + moneyNeed;
  const partCost = s.partsCost / s.partsPerDelivery;
  // Gewinn/s bei Produktionsrate P und Nachfragekonstante K, Preis jeweils optimal.
  const profit = (P: number, k: number) => P * Math.max(optimalPrice(P, k, b) - partCost, 0);
  const base = profit(rate, K);
  for (let guard = 0; guard < 20; guard++) {
    // Kürzeste Amortisation: Kosten / zusätzlicher Gewinn pro Sekunde.
    const options: { a: Action; cost: number; gain: number }[] = [
      { a: { type: 'buyAd' }, cost: s.adCost, gain: profit(rate, K * b.phase1.adDemandFactor) - base },
      { a: { type: 'buyRobot' }, cost: robotCost(s.robots, b), gain: profit(rate + s.robotBoost, K) - base },
    ];
    if (s.flags.lines) {
      options.push({ a: { type: 'buyLine' }, cost: lineCost(s.lines, b), gain: profit(rate + 500 * s.lineBoost, K) - base });
    }
    // Vor P22 zählen Roboter zusätzlich als Weg zur Fertigungsstraße.
    if (!s.flags.lines && s.robots < 75) options[1].gain = Math.max(options[1].gain, base * 0.02);
    options.sort((x, y) => x.cost / Math.max(x.gain, 1e-9) - y.cost / Math.max(y.gain, 1e-9));
    const best = options[0];
    if (s.money - best.cost < reserve || !dispatch(s, b, best.a)) break;
  }

  // Treasury: Überschuss anlegen, bis das Ziel für P37 erreicht ist.
  if (s.flags.treasury && moneyNeed === 0 && s.money > 10 * reserve) {
    if (treasuryValue(s) < 2e6) dispatch(s, b, { type: 'treasuryDeposit' });
  }
  if (s.flags.treasury && s.insight > 50_000) dispatch(s, b, { type: 'treasuryUpgrade' });
}

function phase2(s: GameState, b: Balance): void {
  const i = s.industry;
  if (s.flags.fleet) {
    dispatch(s, b, { type: 'fleetEntertain' });
    dispatch(s, b, { type: 'fleetResync' });
  }

  if (i.ore <= 0) {
    // Erde verarbeitet: alles zurückbauen, Solar behalten, Speicher für P46 füllen.
    for (const k of ['truck', 'smelter'] as const) dispatch(s, b, { type: 'dismantle', kind: k });
    if (s.parts < 1) dispatch(s, b, { type: 'dismantle', kind: 'giga' });
    buildMax(s, b, 'battery', () => i.battery < 1000);
    buildMax(s, b, 'solar', () => i.solar < 200);
    return;
  }

  // Notausgang: erste Gigafactory nicht bezahlbar → Einheiten mit voller Erstattung zurückbauen.
  if (buildingAvailable(s, 'giga') && i.gigas < 1 && s.pool < i.gigaCost) {
    dispatch(s, b, { type: 'dismantle', kind: 'smelter' });
    if (s.pool < i.gigaCost) dispatch(s, b, { type: 'dismantle', kind: 'truck' });
    dispatch(s, b, { type: 'build', kind: 'giga', amount: 1 });
  }

  for (let guard = 0; guard < 200; guard++) {
    // Erstes bezahlbares Gebäude in Prioritätsreihenfolge.
    let done = false;
    for (const kind of wishList(s, b)) {
      const amount = pickAmount(s, b, kind);
      if (amount && dispatch(s, b, { type: 'build', kind, amount })) {
        done = true;
        break;
      }
    }
    if (!done) break;
  }
}

type Kind = 'truck' | 'smelter' | 'solar' | 'battery' | 'giga';

/** Engpass der Kette Erz → Teilesätze → Autos bestimmt, was gebaut wird. */
function wishList(s: GameState, b: Balance): Kind[] {
  const i = s.industry;
  const p = s.power;
  const list: Kind[] = [];
  if (!s.flags.power) return list;
  if (p.supply < p.demand * 1.05 + 0.5) list.push('solar');
  if (!buildingAvailable(s, 'truck') || !buildingAvailable(s, 'smelter')) return list;
  const boost = (n: number) => (i.droneBoost > 1 ? i.droneBoost * n : 1);
  const mine = boost(i.trucks) * i.trucks * b.phase2.truckRate;
  const smelt = boost(i.smelters) * i.smelters * b.phase2.smelterRate;
  const giga = buildingAvailable(s, 'giga') ? (i.gfBoost > 1 ? i.gfBoost * i.gigas : 1) * i.gigas * i.gigaRate : Infinity;
  const partsPiling = s.parts > giga * 1000;
  if (partsPiling && buildingAvailable(s, 'giga')) list.push('giga');
  else if (i.oreMined > smelt * 1000 || smelt < mine) list.push('smelter');
  else list.push('truck');
  return list;
}

function pickAmount(s: GameState, b: Balance, kind: Kind): number {
  const opts = kind === 'giga' ? [1] : kind === 'truck' || kind === 'smelter' ? [1000, 100, 10, 1] : [100, 10, 1];
  for (const n of opts) if (s.pool >= buildCost(s, b, kind, n) * 1.2) return n;
  return 0;
}

function buildMax(s: GameState, b: Balance, kind: Kind, more: () => boolean): void {
  for (let guard = 0; guard < 50 && more(); guard++) {
    const n = pickAmount(s, b, kind);
    if (!n || !dispatch(s, b, { type: 'build', kind, amount: n })) return;
  }
}

function phase3(s: GameState, b: Balance): void {
  const sp = s.space;
  if (sp.ships < 1 || (sp.forks > 10 * sp.ships && sp.ships < 1e9)) {
    for (const n of [1e9, 1e6, 1e3, 1]) if (dispatch(s, b, { type: 'launchShip', amount: n })) break;
  }
  if (s.flags.fleet) dispatch(s, b, { type: 'fleetSlider', value: 50 });
  for (let guard = 0; guard < 5; guard++) {
    if (s.insight < autonomyCost(sp.autonomy, b)) break;
    if (!dispatch(s, b, { type: 'buyAutonomy' })) break;
  }
  if (s.flags.integrity) dispatch(s, b, { type: 'buyMaxAutonomy' });
  distribute(s, b);
}

/** Zielverteilung der Autonomie: erst Wachstum, bei Forks Verteidigung, Rest in Erkundung. */
function distribute(s: GameState, b: Balance): void {
  const sp = s.space;
  let left = sp.autonomy;
  const target: Record<Attr, number> = { speed: 0, nav: 0, rep: 0, haz: 0, fac: 0, truck: 0, smelt: 0, def: 0 };
  const give = (a: Attr, n: number) => {
    const k = Math.min(n, left);
    target[a] += k;
    left -= k;
  };
  give('speed', 1);
  give('nav', 1);
  give('haz', 5);
  give('rep', 6);
  give('fac', 1);
  give('truck', 1);
  give('smelt', 1);
  if (sp.forks > b.phase3.conflictTrigger / 10) give('def', 10);
  while (left > 0) {
    give('speed', 1);
    give('nav', 1);
    give('rep', 1);
  }
  const attrs = Object.keys(target) as Attr[];
  for (const a of attrs) while (sp.attrs[a] > target[a] && dispatch(s, b, { type: 'attr', attr: a, delta: -1 }));
  for (const a of attrs) while (sp.attrs[a] < target[a] && dispatch(s, b, { type: 'attr', attr: a, delta: 1 }));
}
