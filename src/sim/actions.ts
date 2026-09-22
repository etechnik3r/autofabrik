import type { Balance } from './balance';
import { build, canBuild, dismantle, buildingCount } from './buildings';
import { allocateCompute, canAllocateCompute } from './compute';
import { canEntertain, canResync, entertain, resync } from './fleet';
import { lineCost, robotCost } from './formulas';
import { produce } from './production';
import { buyParts } from './phase1';
import {
  buyAutonomy,
  buyMaxAutonomy,
  canBuyAutonomy,
  canBuyMaxAutonomy,
  canChangeAttr,
  canLaunchShip,
  changeAttr,
  launchShip,
} from './phase3';
import { buyProject, canBuyProject } from './projects';
import { quantumCompute } from './quantum';
import type { Attr, BuildingKind, GameState, Risk } from './state';
import { canRunTourney, runTourney } from './strategy';
import { canUpgrade, deposit, upgrade, withdraw } from './treasury';

/** Alle Spielereingaben. UI und Bots benutzen ausschließlich diese Schnittstelle. */
export type Action =
  | { type: 'makeCar' }
  | { type: 'buyParts' }
  | { type: 'price'; delta: number }
  | { type: 'buyAd' }
  | { type: 'buyRobot' }
  | { type: 'buyLine' }
  | { type: 'addCore' }
  | { type: 'addStorage' }
  | { type: 'toggleAutoBuy' }
  | { type: 'project'; id: string }
  | { type: 'treasuryDeposit' }
  | { type: 'treasuryWithdraw' }
  | { type: 'treasuryRisk'; risk: Risk }
  | { type: 'treasuryUpgrade' }
  | { type: 'selectStrategy'; index: number }
  | { type: 'runTourney' }
  | { type: 'quantum' }
  | { type: 'build'; kind: BuildingKind; amount: number }
  | { type: 'dismantle'; kind: BuildingKind }
  | { type: 'fleetSlider'; value: number }
  | { type: 'fleetEntertain' }
  | { type: 'fleetResync' }
  | { type: 'launchShip'; amount?: number }
  | { type: 'buyAutonomy' }
  | { type: 'attr'; attr: Attr; delta: number }
  | { type: 'buyMaxAutonomy' };

type Handler<A extends Action> = {
  can: (s: GameState, b: Balance, a: A) => boolean;
  run: (s: GameState, b: Balance, a: A) => void;
};
type Handlers = { [T in Action['type']]: Handler<Extract<Action, { type: T }>> };

const p1 = (s: GameState) => s.phase === 1;

const handlers: Handlers = {
  makeCar: {
    can: (s) => s.parts >= 1,
    run: (s) => produce(s, 1),
  },
  buyParts: {
    can: (s) => p1(s) && s.money >= s.partsCost,
    run: (s, b) => void buyParts(s, b),
  },
  price: {
    can: (s, b, a) => p1(s) && s.price + a.delta * b.phase1.priceStep >= b.phase1.priceMin,
    run: (s, b, a) => void (s.price += a.delta * b.phase1.priceStep),
  },
  buyAd: {
    can: (s) => p1(s) && s.money >= s.adCost,
    run: (s, b) => {
      s.money -= s.adCost;
      s.adLevel++;
      s.adCost *= b.phase1.adCostFactor;
    },
  },
  buyRobot: {
    can: (s, b) => p1(s) && s.flags.robots && s.money >= robotCost(s.robots, b),
    run: (s, b) => {
      s.money -= robotCost(s.robots, b);
      s.robots++;
    },
  },
  buyLine: {
    can: (s, b) => p1(s) && s.flags.lines && s.money >= lineCost(s.lines, b),
    run: (s, b) => {
      s.money -= lineCost(s.lines, b);
      s.lines++;
    },
  },
  addCore: {
    can: (s) => s.flags.compute && canAllocateCompute(s),
    run: (s) => void allocateCompute(s, 'core'),
  },
  addStorage: {
    can: (s) => s.flags.compute && canAllocateCompute(s),
    run: (s) => void allocateCompute(s, 'storage'),
  },
  toggleAutoBuy: {
    can: (s) => p1(s) && s.flags.autoBuyAvailable,
    run: (s) => void (s.flags.autoBuy = !s.flags.autoBuy),
  },
  project: {
    can: (s, b, a) => canBuyProject(s, b, a.id),
    run: (s, b, a) => void buyProject(s, b, a.id),
  },
  treasuryDeposit: {
    can: (s) => p1(s) && s.flags.treasury && s.money > 0,
    run: (s) => void deposit(s),
  },
  treasuryWithdraw: {
    can: (s) => p1(s) && s.flags.treasury && s.treasury.bankroll > 0,
    run: (s) => void withdraw(s),
  },
  treasuryRisk: {
    can: (s) => p1(s) && s.flags.treasury,
    run: (s, _b, a) => void (s.treasury.risk = a.risk),
  },
  treasuryUpgrade: {
    can: (s, b) => p1(s) && s.flags.treasury && canUpgrade(s, b),
    run: (s, b) => void upgrade(s, b),
  },
  selectStrategy: {
    can: (s, _b, a) => s.flags.strategy && a.index >= 0 && a.index < s.strategy.unlocked,
    run: (s, _b, a) => void (s.strategy.selected = a.index),
  },
  runTourney: {
    can: (s, b) => canRunTourney(s, b),
    run: (s, b) => void runTourney(s, b),
  },
  quantum: {
    can: (s) => s.flags.quantum && s.quantum.chips > 0,
    run: (s, b) => void quantumCompute(s, b),
  },
  build: {
    can: (s, b, a) => canBuild(s, b, a.kind, a.amount),
    run: (s, b, a) => void build(s, b, a.kind, a.amount),
  },
  dismantle: {
    can: (s, _b, a) => s.phase === 2 && buildingCount(s, a.kind) > 0,
    run: (s, b, a) => void dismantle(s, b, a.kind),
  },
  fleetSlider: {
    can: (s, _b, a) => s.flags.fleet && a.value >= 0 && a.value <= 200,
    run: (s, _b, a) => void (s.fleet.slider = Math.round(a.value)),
  },
  fleetEntertain: {
    can: (s) => canEntertain(s),
    run: (s, b) => void entertain(s, b),
  },
  fleetResync: {
    can: (s, b) => canResync(s, b),
    run: (s, b) => void resync(s, b),
  },
  launchShip: {
    can: (s, b, a) => canLaunchShip(s, b, a.amount ?? 1),
    run: (s, b, a) => void launchShip(s, b, a.amount ?? 1),
  },
  buyAutonomy: {
    can: (s, b) => canBuyAutonomy(s, b),
    run: (s, b) => void buyAutonomy(s, b),
  },
  attr: {
    can: (s, _b, a) => canChangeAttr(s, a.attr, a.delta),
    run: (s, _b, a) => void changeAttr(s, a.attr, a.delta),
  },
  buyMaxAutonomy: {
    can: (s, b) => canBuyMaxAutonomy(s, b),
    run: (s, b) => void buyMaxAutonomy(s, b),
  },
};

function handlerFor<A extends Action>(a: A): Handler<A> {
  return handlers[a.type] as unknown as Handler<A>;
}

export function canDo(s: GameState, b: Balance, a: Action): boolean {
  return handlerFor(a).can(s, b, a);
}

/** Führt die Aktion aus, falls erlaubt. Gibt zurück, ob sie ausgeführt wurde. */
export function dispatch(s: GameState, b: Balance, a: Action): boolean {
  const h = handlerFor(a);
  if (!h.can(s, b, a)) return false;
  h.run(s, b, a);
  return true;
}
