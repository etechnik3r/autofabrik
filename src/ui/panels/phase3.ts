import { autonomyCost } from '../../sim/formulas';
import { combatOdds } from '../../sim/conflict';
import { ATTR_NAMES, LAUNCH_AMOUNTS, attrSum } from '../../sim/phase3';
import { ATTRS } from '../../sim/state';
import { definePanel } from '../dom';
import { fmtNum, fmtPct } from '../format';

export const expansionPanel = definePanel({
  id: 'expansion',
  title: 'Expansion',
  column: 3,
  visible: (s) => s.phase === 3,
  build(p) {
    const b = p.game.b;
    p.stat('Erkundet', (s) => fmtPct((s.space.found / b.phase3.universe) * 100, 6));
    p.bar((s) => s.space.found / b.phase3.universe);
    p.stat('Werksschiffe', (s) => fmtNum(s.space.ships));
    p.group('row', undefined, (r) => {
      for (const n of LAUNCH_AMOUNTS) {
        r.button(`Start ×${fmtNum(n)}`, { type: 'launchShip', amount: n }, {
          title: `Kosten: ${fmtNum(n * b.phase3.shipCost)} Autos`,
        });
      }
    });
    p.stat('Gestartet', (s) => fmtNum(s.space.launched));
    p.stat('Verloren: Gefahren', (s) => fmtNum(s.space.lostHazard));
    p.stat('Verloren: Drift', (s) => fmtNum(s.space.lostDrift));
    p.stat('Verloren: Konflikte', (s) => fmtNum(s.space.lostConflict));
    p.stat('Forks', (s) => fmtNum(s.space.forks));
    p.stat('Forks zerstört', (s) => fmtNum(s.space.forksDestroyed), (s) => s.space.forksDestroyed > 0);
    p.text(
      'Ohne Abschirmung geht im All jeden Tick 1 % der Schiffe verloren. Wachstum gibt es nur, wenn Replikation Gefahren und Drift übertrifft.',
      'hint',
      (s) => s.space.attrs.haz === 0,
    );
  },
});

export const shipDesignPanel = definePanel({
  id: 'shipDesign',
  title: 'Schiffs-Design',
  column: 3,
  visible: (s) => s.phase === 3,
  build(p) {
    const b = p.game.b;
    p.stat('Autonomie', (s) => `${attrSum(s)} / ${s.space.autonomy} (max. ${s.space.maxAutonomy})`);
    p.button((s) => `+1 Autonomie (${fmtNum(autonomyCost(s.space.autonomy, b))} Marktwissen)`, { type: 'buyAutonomy' });
    for (const attr of ATTRS) {
      p.group('attr', undefined, (g) => {
        g.stat(ATTR_NAMES[attr], (s) => String(s.space.attrs[attr]));
        g.group('row', undefined, (r) => {
          r.button('−', { type: 'attr', attr, delta: -1 });
          r.button('+', { type: 'attr', attr, delta: 1 });
        });
      });
    }
    p.stat('Wachstum je Tick', (s) => {
      const a = s.space.attrs;
      const rep = b.phase3.repRate * a.rep;
      let haz = b.phase3.hazRate / (3 * Math.pow(a.haz, b.phase3.hazExp) + 1);
      if (s.flags.hazardShield) haz *= 0.5;
      const drift = s.flags.noDrift ? 0 : b.phase3.driftRate * Math.pow(s.space.autonomy, b.phase3.driftExp);
      const g = rep - haz - drift;
      return `${g >= 0 ? '+' : ''}${(g * 100).toFixed(4).replace('.', ',')} %`;
    });
  },
});

export const conflictPanel = definePanel({
  id: 'conflict',
  title: (s) => (s.conflict.active && s.flags.integrity ? s.conflict.name : 'Konflikt'),
  column: 3,
  visible: (s) => s.phase === 3 && (s.conflict.wins + s.conflict.losses + s.conflict.draws > 0 || s.conflict.active),
  build(p) {
    const b = p.game.b;
    p.stat('Eigene Verbände', (s) => (s.conflict.active ? `${s.conflict.L} / ${s.conflict.L0}` : '–'));
    p.bar((s) => (s.conflict.active ? s.conflict.L / s.conflict.L0 : 0), 'bar own');
    p.stat('Fork-Verbände', (s) => (s.conflict.active ? `${s.conflict.R} / ${s.conflict.R0}` : '–'));
    p.bar((s) => (s.conflict.active ? s.conflict.R / s.conflict.R0 : 0), 'bar enemy');
    p.stat('Kampfkraft', (s) => {
      if (!s.conflict.active) return '–';
      const o = combatOdds(s, b, s.conflict.L, s.conflict.R);
      return `Verlust ${fmtPct(o.pOwn * 100)} · Treffer ${fmtPct(o.pFork * 100)}`;
    }, (s) => s.flags.defense);
    p.stat('Siege / Niederlagen / Remis', (s) => `${s.conflict.wins} / ${s.conflict.losses} / ${s.conflict.draws}`);
    p.stat('Integrität', (s) => fmtNum(s.space.integrity), (s) => s.flags.integrity);
    p.stat('Serienbonus', (s) => fmtNum(s.space.streakBonus), (s) => s.flags.streak);
    p.button(`Max. Autonomie +${b.phase3.maxAutonomyStep} (${fmtNum(Math.ceil(b.phase3.maxAutonomyCost))} Integrität)`, {
      type: 'buyMaxAutonomy',
    }, { visible: (s) => s.flags.integrity });
  },
});
