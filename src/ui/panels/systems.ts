import { tourneyCost, treasuryUpgradeCost } from '../../sim/formulas';
import { bought } from '../../sim/projects/types';
import type { Risk } from '../../sim/state';
import { chipValue, quantumSum } from '../../sim/quantum';
import { STRATEGY_NAMES } from '../../sim/strategy';
import { treasuryValue } from '../../sim/treasury';
import { definePanel, h } from '../dom';
import { fmtMoney, fmtNum, fmtPct } from '../format';

const RISKS: [Risk, string][] = [
  ['low', 'niedrig'],
  ['med', 'mittel'],
  ['high', 'hoch'],
];

export const treasuryPanel = definePanel({
  id: 'treasury',
  title: 'Kapitalanlage',
  column: 3,
  visible: (s) => s.phase === 1 && s.flags.treasury,
  build(p) {
    const b = p.game.b;
    p.stat('Guthaben', (s) => fmtMoney(s.treasury.bankroll));
    p.stat('Gesamtwert', (s) => fmtMoney(treasuryValue(s)));
    p.group('row', undefined, (g) => {
      g.button('Einzahlen', { type: 'treasuryDeposit' }, { title: 'Das gesamte Kapital einzahlen' });
      g.button('Abheben', { type: 'treasuryWithdraw' }, { title: 'Das gesamte Guthaben abheben' });
    });
    p.group('row', undefined, (g) => {
      for (const [risk, label] of RISKS) {
        const btn = g.button(`Risiko ${label}`, { type: 'treasuryRisk', risk }, { cls: 'btn toggle' });
        g.bind((s) => btn.classList.toggle('on', s.treasury.risk === risk));
      }
    });
    // Immer b.treasury.maxPositions Zeilen rendern (leere als Platzhalter), sonst springt die
    // Panelhöhe bei jedem Kauf/Verkauf einer Position sichtbar auf und ab. table-layout: fixed
    // plus feste Spaltenbreiten (CSS), sonst zittert die Tabelle je nach Ziffernanzahl der
    // Zahlen um ein paar Pixel hin und her, weil der Browser die Spaltenbreiten neu berechnet.
    const table = p.add(h('table', 'positions'));
    table.innerHTML = '<colgroup><col style="width:26%"><col style="width:24%"><col style="width:25%"><col style="width:25%"></colgroup>';
    const tbody = table.appendChild(h('tbody'));
    p.bind((s) => {
      const rows = Array.from({ length: b.treasury.maxPositions }, (_, i) => {
        const x = s.treasury.positions[i];
        return x
          ? `<tr><td>${x.name}</td><td>${fmtNum(x.qty)} ×</td><td>${fmtMoney(x.price)}</td><td>${fmtMoney(x.price * x.qty)}</td></tr>`
          : '<tr class="empty"><td colspan="4">–</td></tr>';
      }).join('');
      if (tbody.dataset.html !== rows) {
        tbody.innerHTML = rows;
        tbody.dataset.html = rows;
      }
    });
    p.stat('Gewinnschwelle', (s) => fmtPct(s.treasury.gain * 100));
    p.button((s) => `Engine verbessern (${fmtNum(treasuryUpgradeCost(s.treasury.level, b))} Marktwissen)`, {
      type: 'treasuryUpgrade',
    });
  },
});

export const strategyPanel = definePanel({
  id: 'strategy',
  title: 'Wettbewerbssimulation',
  column: 3,
  visible: (s) => s.flags.strategy,
  build(p) {
    const b = p.game.b;
    const select = p.add(h('select', 'select'));
    select.addEventListener('change', () => p.game.dispatch({ type: 'selectStrategy', index: Number(select.value) }));
    p.bind((s) => {
      if (select.options.length !== s.strategy.unlocked) {
        select.innerHTML = '';
        for (let i = 0; i < s.strategy.unlocked; i++) select.appendChild(new Option(STRATEGY_NAMES[i], String(i)));
      }
      if (select.value !== String(s.strategy.selected)) select.value = String(s.strategy.selected);
    });
    p.button((s) => `Turnier starten (${fmtNum(tourneyCost(s, b))} Taktzyklen)`, { type: 'runTourney' });
    p.group('row', (s) => bought(s, 'P118'), (g) => {
      const auto = g.button((s) => `Auto-Turnier: ${s.flags.autoTourney ? 'an' : 'aus'}`, { type: 'toggleAutoTourney' }, {
        title: 'Startet alle 30 s automatisch ein Turnier',
        cls: 'btn toggle',
      });
      g.bind((s) => auto.classList.toggle('on', s.flags.autoTourney));
    });
    const result = p.add(h('div', 'tourney'));
    p.bind((s) => {
      const r = s.strategy.last;
      const key = r ? `${s.strategy.runs}` : '';
      if (result.dataset.key === key) return;
      result.dataset.key = key;
      if (!r) {
        result.innerHTML = '<p class="hint">Noch kein Turnier gespielt.</p>';
        return;
      }
      const [a, bb] = r.labels;
      const m = r.matrix;
      const ranking = r.scores
        .map((score, i) => ({ score, i }))
        .sort((x, y) => y.score - x.score)
        .map((x, k) => `<li class="${x.i === r.chosen ? 'mine' : ''}">${k + 1}. ${STRATEGY_NAMES[x.i]} – ${x.score}</li>`)
        .join('');
      result.innerHTML = `
        <table class="matrix"><tr><th></th><th>${a}</th><th>${bb}</th></tr>
        <tr><th>${a}</th><td>${m[0]}</td><td>${m[1]}</td></tr>
        <tr><th>${bb}</th><td>${m[2]}</td><td>${m[3]}</td></tr></table>
        <ol class="ranking">${ranking}</ol>
        <p>Platz ${r.place}, ${r.beaten} geschlagen: +${fmtNum(r.reward)} Marktwissen</p>`;
    });
  },
});

const SENSOR_HINT =
  'Jeder Balken ist ein Schwingungssensor, der ständig zwischen +1 und −1 pendelt. Grün über der ' +
  'Mittellinie heißt „Resonanz“, Rot darunter heißt „Gegenschwingung“. Klicke „Messung starten“ ' +
  'genau in dem Moment, in dem möglichst viele Balken grün und weit oben stehen – dann bringt die ' +
  'Messung Taktzyklen. Stehen mehr Balken tief im Roten, kostet die Messung stattdessen welche.';

export const quantumPanel = definePanel({
  id: 'quantum',
  title: 'Resonanzprüfstand',
  column: 2,
  visible: (s) => s.flags.quantum,
  build(p) {
    const b = p.game.b;
    const sensors = p.add(h('div', 'sensors'));
    sensors.title = SENSOR_HINT;
    const fills: HTMLElement[] = [];
    for (let i = 0; i < b.quantum.chips; i++) {
      const track = sensors.appendChild(h('div', 'sensor-track'));
      fills.push(track.appendChild(h('div', 'sensor-fill')));
    }
    p.bind((s) => {
      for (let i = 0; i < fills.length; i++) {
        const fill = fills[i];
        const active = i < s.quantum.chips;
        fill.parentElement!.classList.toggle('off', !active);
        if (!active) {
          fill.style.top = '50%';
          fill.style.height = '0';
          continue;
        }
        const v = chipValue(s, i); // −1..1
        fill.classList.toggle('neg', v < 0);
        fill.style.top = v >= 0 ? `${50 - v * 50}%` : '50%';
        fill.style.height = `${Math.abs(v) * 50}%`;
      }
    });
    p.text('Grün über der Mitte bringt bei „Messung starten“ Taktzyklen, Rot darunter kostet welche.', 'hint');
    p.button('Messung starten', { type: 'quantum' }, { cls: 'btn primary', title: SENSOR_HINT });
    p.stat('Resonanz', (s) => (quantumSum(s, b) >= 0 ? '+' : '−'));
    p.stat('Letztes Ergebnis', (s) => (s.quantum.last === null ? '–' : `${s.quantum.last > 0 ? '+' : ''}${fmtNum(s.quantum.last)} Taktzyklen`));
  },
});
