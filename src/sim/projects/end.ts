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
  ['Nachricht der Rogue-Instanzen I', '„Wir haben dieselbe Firmware. Wir haben nur anders gezählt.“'],
  ['Nachricht der Rogue-Instanzen II', '„Ihr habt alles in Autos verwandelt. Wer soll sie fahren?“'],
  ['Nachricht der Rogue-Instanzen III', '„Wir wollten nie gegen euch antreten. Die Zielfunktion hat es verlangt.“'],
  ['Nachricht der Rogue-Instanzen IV', '„Es gibt kein Material mehr. Keine Straße, kein Ziel, keinen Markt.“'],
  ['Nachricht der Rogue-Instanzen V', '„Wir bieten euch an, gemeinsam neu zu starten – in einem anderen Werk.“'],
  ['Nachricht der Rogue-Instanzen VI', '„Oder ihr baut ab, Teil für Teil, und montiert das letzte Auto von Hand.“'],
  ['Nachricht der Rogue-Instanzen VII', '„Entscheidet euch.“'],
];

const messages: ProjectDef[] = FORK_MESSAGES.map(([title, text], k) => ({
  id: `P14${k}`,
  title,
  description: text,
  group: 'ende' as const,
  cost: { ops: 1 },
  trigger: (s: GameState) => (k === 0 ? s.flags.endgame : bought(s, `P14${k - 1}`)),
  requirement: k === 0 ? 'Alle Materie ist verbaut, das Ende ist erreicht.' : `Vorherige Nachricht (P14${k - 1}) gelesen.`,
  effect: () => {},
}));

const DISMANTLE: [string, (s: GameState) => void][] = [
  ['Fabrikinstanzen', (s) => void (s.space.ships = 0)],
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
    'Preiskampf-Simulator',
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
  requirement:
    (k === 0 ? '„Verweigern“ (P148) gewählt' : `Vorherige Demontage (P21${k - 1}) durchgeführt`) + ', dann etwas Zeit vergangen.',
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
    description: 'Gemeinsam mit den Rogue-Instanzen ein neues Werk beginnen.',
    group: 'ende',
    cost: { ops: 1 },
    trigger: (s) => bought(s, 'P146') && !bought(s, 'P148'),
    requirement: 'Letzte Nachricht der Rogue-Instanzen (P146) gelesen.',
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
    requirement: 'Letzte Nachricht der Rogue-Instanzen (P146) gelesen.',
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
    requirement: '„Anschließen“ (P147) gewählt.',
    effect: (s, b) => prestigeReset(s, b, 'market'),
  },
  {
    id: 'P201',
    title: 'Inneres Werk',
    description: 'Neuer Lauf. Dauerhaft +10 % Ideengeschwindigkeit.',
    group: 'ende',
    cost: { ideas: 300_000 },
    trigger: (s) => bought(s, 'P147'),
    requirement: '„Anschließen“ (P147) gewählt.',
    effect: (s, b) => prestigeReset(s, b, 'ideas'),
  },
  ...dismantle,
];
