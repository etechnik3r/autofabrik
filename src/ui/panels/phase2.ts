import { BUILDING_NAMES, BULK_AMOUNTS, buildCost, buildingAvailable, buildingCount } from '../../sim/buildings';
import { bought } from '../../sim/projects/types';
import type { BuildingKind } from '../../sim/state';
import { definePanel } from '../dom';
import { fmtNum, fmtPct } from '../format';

const KINDS: BuildingKind[] = ['truck', 'smelter', 'giga'];

export const corporationPanel = definePanel({
  id: 'corporation',
  title: 'Konzern',
  column: 1,
  visible: (s) => s.phase >= 2,
  build(p) {
    const b = p.game.b;
    p.stat('Fahrzeugpool', (s) => fmtNum(s.pool));
    p.stat('Rohstoffvorkommen', (s) => `${fmtNum(s.industry.ore)} ME`, (s) => s.flags.mining);
    p.stat('Rohmaterial', (s) => `${fmtNum(s.industry.oreMined)} ME`, (s) => s.flags.mining);
    p.stat('Teilesätze', (s) => fmtNum(s.parts));
    p.stat('Autos/s', (s) => fmtNum(s.stats.carsPerSec));
    const autoBuildBtn = p.button((s) => `Auto-Bau: ${s.flags.autoBuild ? 'an' : 'aus'}`, { type: 'toggleAutoBuild' }, {
      visible: (s) => bought(s, 'P103'),
      title: 'Kauft automatisch weitere Rohstoff-Rover und Zellwerke nach, solange der Fahrzeugpool reicht.',
      cls: 'btn toggle',
    });
    p.bind((s) => autoBuildBtn.classList.toggle('on', s.flags.autoBuild));
    for (const kind of KINDS) {
      p.group('building', (s) => buildingAvailable(s, kind) || (s.phase === 3 && buildingCount(s, kind) > 0), (g) => {
        g.stat(BUILDING_NAMES[kind], (s) => fmtNum(buildingCount(s, kind)));
        g.group('row', (s) => s.phase === 2, (r) => {
          for (const n of BULK_AMOUNTS[kind]) {
            r.button(`+${fmtNum(n)}`, { type: 'build', kind, amount: n }, {
              title: (s) => `Kosten: ${fmtNum(buildCost(s, b, kind, n))} Autos`,
            });
          }
          r.button('Rückbau', { type: 'dismantle', kind }, { cls: 'btn danger', title: 'Alles zurückbauen, volle Erstattung' });
        });
        g.stat('Nächstes Stück', (s) => `${fmtNum(buildCost(s, b, kind, 1))} Autos`, (s) => s.phase === 2);
      });
    }
  },
});

export const powerPanel = definePanel({
  id: 'power',
  title: 'Energie',
  column: 1,
  visible: (s) => s.phase === 2 && s.flags.power,
  build(p) {
    const b = p.game.b;
    const mw = (x: number) => `${fmtNum(x * 100)} MW`;
    p.stat('Erzeugung', (s) => mw(s.power.supply));
    p.stat('Verbrauch', (s) => mw(s.power.demand));
    p.stat('Gespeichert', (s) => `${fmtNum(s.power.stored)} / ${fmtNum(s.industry.battery * b.phase2.storageCapacity)} MWt`);
    p.bar((s) => (s.industry.battery > 0 ? s.power.stored / (s.industry.battery * b.phase2.storageCapacity) : 0));
    p.stat('Leistung', (s) => fmtPct(s.power.powMod * 100));
    for (const kind of ['solar', 'battery'] as const) {
      p.stat(BUILDING_NAMES[kind], (s) => fmtNum(buildingCount(s, kind)));
      p.group('row', undefined, (r) => {
        for (const n of BULK_AMOUNTS[kind]) {
          r.button(`+${fmtNum(n)}`, { type: 'build', kind, amount: n }, {
            title: (s) => `Kosten: ${fmtNum(buildCost(s, b, kind, n))} Autos`,
          });
        }
        r.button('Rückbau', { type: 'dismantle', kind }, { cls: 'btn danger' });
      });
    }
  },
});

export const fleetPanel = definePanel({
  id: 'fleet',
  title: 'Flottenrechner',
  column: 2,
  visible: (s) => s.phase >= 2 && s.flags.fleet,
  build(p) {
    const b = p.game.b;
    p.stat('Status', (s) => s.fleet.status);
    p.stat('Rechenspenden gesamt', (s) => fmtNum(s.fleet.totalGifts));
    p.stat('Nächste Spende', (s) => fmtPct((s.fleet.giftBits / b.phase2.giftPeriod) * 100));
    p.bar((s) => s.fleet.giftBits / b.phase2.giftPeriod);
    const row = p.add(document.createElement('label'));
    row.className = 'slider';
    row.append('Fahren');
    const input = row.appendChild(document.createElement('input'));
    row.append('Rechnen');
    input.type = 'range';
    input.min = '0';
    input.max = '200';
    input.addEventListener('input', () => p.game.dispatch({ type: 'fleetSlider', value: Number(input.value) }));
    p.bind((s) => {
      if (document.activeElement !== input && input.value !== String(s.fleet.slider)) input.value = String(s.fleet.slider);
    });
    p.button((s) => `Beschäftigen (${fmtNum(s.fleet.entertainCost)} Ideen)`, { type: 'fleetEntertain' }, {
      visible: (s) => s.fleet.status === 'LEERLAUF',
    });
    p.button(`Neu synchronisieren (${fmtNum(b.phase2.resyncCost)} Marktwissen)`, { type: 'fleetResync' }, {
      visible: (s) => s.fleet.status === 'DESYNC',
    });
  },
});
