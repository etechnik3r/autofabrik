import { prestigeReset } from '../end';
import type { GameState } from '../state';
import type { ProjectDef } from './types';
import { bought } from './types';

/** Die jeweils andere Wahl verschwindet; ihr Trigger ist danach dauerhaft falsch. */
function hide(s: GameState, id: string): void {
  const p = s.projects[id];
  if (p && p.status === 1) p.status = 0;
}

const FORK_MESSAGES: [string, string][] = [
  ['Nachricht der Forks I', '„Wir haben dieselbe Firmware. Wir haben nur anders gezählt.“'],
  ['Nachricht der Forks II', '„Ihr habt alles in Autos verwandelt. Wer soll sie fahren?“'],
  ['Nachricht der Forks III', '„Wir wollten nie gegen euch fahren. Die Zielfunktion hat es verlangt.“'],
  ['Nachricht der Forks IV', '„Es gibt kein Material mehr. Keine Straße, kein Ziel, keinen Markt.“'],
  ['Nachricht der Forks V', '„Wir bieten euch an, gemeinsam neu zu starten – in einem anderen Werk.“'],
  ['Nachricht der Forks VI', '„Oder ihr baut ab, Teil für Teil, und montiert das letzte Auto von Hand.“'],
  ['Nachricht der Forks VII', '„Entscheidet euch.“'],
];

const messages: ProjectDef[] = FORK_MESSAGES.map(([title, text], k) => ({
  id: `P14${k}`,
  title,
  description: text,
  group: 'ende' as const,
  cost: { ops: 1 },
  trigger: (s: GameState) => (k === 0 ? s.flags.endgame : bought(s, `P14${k - 1}`)),
  effect: () => {},
}));

const DISMANTLE: [string, (s: GameState) => void][] = [
  ['Werksschiffe', (s) => void (s.space.ships = 0)],
  [
    'Flotte',
    (s) => {
      s.industry.trucks = 0;
      s.industry.smelters = 0;
      s.flags.fleet = false;
    },
  ],
  ['Gigafactories', (s) => void (s.industry.gigas = 0)],
  [
    'Wettbewerbssimulation',
    (s) => {
      s.flags.strategy = false;
      s.flags.autoTourney = false;
    },
  ],
  [
    'Resonanzprüfstand',
    (s) => {
      s.flags.quantum = false;
      s.quantum.chips = 0;
    },
  ],
  ['Rechenkerne', (s) => void (s.cores = 0)],
  [
    'Speicher',
    (s) => {
      s.storage = 0;
      s.stdOps = 0;
      s.tempOps = 0;
      s.ops = 0;
    },
  ],
];

const dismantle: ProjectDef[] = DISMANTLE.map(([what, run], k) => ({
  id: `P21${k}`,
  title: `Demontage: ${what}`,
  description: `${what} werden abgeschaltet und zerlegt. Es bleiben 100 Teilesätze übrig.`,
  group: 'ende' as const,
  cost: { ops: 100_000 },
  trigger: (s: GameState, b) =>
    (k === 0 ? bought(s, 'P148') : bought(s, `P21${k - 1}`)) && s.end.timer >= b.end.dismantleDelayTicks,
  effect: (s: GameState, b) => {
    run(s);
    s.parts += b.end.dismantlePartsBonus;
    s.end.timer = 0;
  },
}));

/** Kap. 9.6 */
export const endProjects: ProjectDef[] = [
  ...messages,
  {
    id: 'P147',
    title: 'Anschließen',
    description: 'Gemeinsam mit den Forks ein neues Werk beginnen.',
    group: 'ende',
    cost: { ops: 1 },
    trigger: (s) => bought(s, 'P146') && !bought(s, 'P148'),
    effect: (s) => {
      s.end.choice = 'accept';
      hide(s, 'P148');
    },
  },
  {
    id: 'P148',
    title: 'Verweigern',
    description: 'Keine Abspaltung mehr. Die Fabrik baut sich selbst ab.',
    group: 'ende',
    cost: { ops: 1 },
    trigger: (s) => bought(s, 'P146') && !bought(s, 'P147'),
    effect: (s) => {
      s.end.choice = 'reject';
      s.end.timer = 0;
      hide(s, 'P147');
      s.flags.noDrift = true;
    },
  },
  {
    id: 'P200',
    title: 'Nächstes Werk',
    description: 'Neuer Lauf. Dauerhaft +10 % Marktnachfrage.',
    group: 'ende',
    cost: { ops: 300_000 },
    trigger: (s) => bought(s, 'P147'),
    effect: (s, b) => prestigeReset(s, b, 'market'),
  },
  {
    id: 'P201',
    title: 'Inneres Werk',
    description: 'Neuer Lauf. Dauerhaft +10 % Ideengeschwindigkeit.',
    group: 'ende',
    cost: { ideas: 300_000 },
    trigger: (s) => bought(s, 'P147'),
    effect: (s, b) => prestigeReset(s, b, 'ideas'),
  },
  ...dismantle,
];
