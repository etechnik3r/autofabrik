import { tourneyCost, treasuryUpgradeCost } from '../../sim/formulas';
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
  title: 'Treasury',
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
    const table = p.add(h('table', 'positions'));
    p.bind((s) => {
      const rows = s.treasury.positions
        .map((x) => `<tr><td>${x.name}</td><td>${fmtNum(x.qty)} ×</td><td>${fmtMoney(x.price)}</td><td>${fmtMoney(x.price * x.qty)}</td></tr>`)
        .join('');
      if (table.dataset.html !== rows) {
        table.innerHTML = rows;
        table.dataset.html = rows;
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
    p.button((s) => `Turnier starten (${fmtNum(tourneyCost(s, b))} Ops)`, { type: 'runTourney' });
    p.text((s) => (s.flags.autoTourney ? 'Auto-Turnier aktiv (alle 30 s).' : ''), 'hint');
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

export const quantumPanel = definePanel({
  id: 'quantum',
  title: 'Quantenrechner',
  column: 2,
  visible: (s) => s.flags.quantum,
  build(p) {
    const b = p.game.b;
    const chips = p.add(h('div', 'chips'));
    const cells: HTMLElement[] = [];
    for (let i = 0; i < b.quantum.chips; i++) cells.push(chips.appendChild(h('span', 'chip')));
    p.bind((s) => {
      for (let i = 0; i < cells.length; i++) {
        const active = i < s.quantum.chips;
        cells[i].classList.toggle('off', !active);
        cells[i].style.opacity = active ? String(0.15 + 0.85 * Math.max(0, chipValue(s, i))) : '';
      }
    });
    p.button('Berechnen', { type: 'quantum' }, { cls: 'btn primary' });
    p.stat('Überlagerung', (s) => (quantumSum(s, b) >= 0 ? '+' : '−'));
    p.stat('Letztes Ergebnis', (s) => (s.quantum.last === null ? '–' : `${s.quantum.last > 0 ? '+' : ''}${fmtNum(s.quantum.last)} Ops`));
  },
});
