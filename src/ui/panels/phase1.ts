import { demandConstant, expectedSales, lineCost, optimalPrice, robotCost } from '../../sim/formulas';
import { avgIncome } from '../../sim/phase1';
import { definePanel } from '../dom';
import { fmtMoney, fmtNum, fmtPct, fmtRate } from '../format';

const p1 = (s: { phase: number }) => s.phase === 1;

export const assemblyPanel = definePanel({
  id: 'assembly',
  title: 'Montage',
  column: 1,
  // Nach der Demontage (Ende „Verweigern“) werden die letzten Teilesätze wieder von Hand montiert.
  visible: (s) => s.phase === 1 || s.end.choice === 'reject',
  build(p) {
    p.button('Auto montieren', { type: 'makeCar' }, { cls: 'btn primary' });
    p.stat('Teilesätze', (s) => fmtNum(s.parts));
    p.stat('Autos/s', (s) => fmtRate(s.stats.carsPerSec));
    p.text('Das Geld reicht nicht für die nächste Lieferung. Senke den Preis, um das Lager zu leeren.', 'hint warn', (s) =>
      p1(s) && s.money < s.partsCost && s.parts < 100 && s.treasury.bankroll < s.partsCost,
    );
  },
});

export const salesPanel = definePanel({
  id: 'sales',
  title: 'Vertrieb',
  column: 1,
  visible: p1,
  build(p) {
    p.stat('Kapital', (s) => fmtMoney(s.money));
    p.stat('Lager', (s) => fmtNum(s.stock));
    p.stat('Preis je Auto', (s) => fmtMoney(s.price));
    p.group('row', undefined, (g) => {
      g.button('−', { type: 'price', delta: -1 }, { title: 'Preis −1 k∈', enabled: (s) => !s.flags.autoPrice });
      g.button('+', { type: 'price', delta: 1 }, { title: 'Preis +1 k∈', enabled: (s) => !s.flags.autoPrice });
      const cruise = g.button((s) => `🎚️ Tempomat: ${s.flags.autoPrice ? 'an' : 'aus'}`, { type: 'toggleAutoPrice' }, {
        visible: (s) => s.flags.autoPriceAvailable,
        title: 'Hält den Preis automatisch auf der Preisempfehlung',
        cls: 'btn toggle',
      });
      g.bind((s) => cruise.classList.toggle('on', s.flags.autoPrice));
    });
    p.stat('Marktnachfrage', (s) => fmtPct(s.demand * 10));
    p.stat('Erwarteter Absatz', (s) => `${fmtRate(expectedSales(s.demand, p.game.b))} Autos/s`);
    p.stat('Umsatz/s', (s) => fmtMoney(avgIncome(s)), (s) => s.flags.revenue);
    p.stat('Verkauft/s', (s) => fmtRate(s.stats.soldPerSec), (s) => s.flags.revenue);
    p.stat(
      'Preisempfehlung',
      (s) => {
        const P = Math.max(s.stats.carsPerSec, 0.1);
        return fmtMoney(optimalPrice(P, demandConstant(s, p.game.b), p.game.b));
      },
      (s) => s.flags.revenue,
    );
    p.heading('Marketing');
    p.stat('Kampagnen', (s) => String(s.adLevel));
    p.button((s) => `Werbekampagne (${fmtMoney(s.adCost)})`, { type: 'buyAd' });
  },
});

export const purchasingPanel = definePanel({
  id: 'purchasing',
  title: 'Einkauf',
  column: 1,
  visible: p1,
  build(p) {
    p.stat('Preis je Lieferung', (s) => fmtMoney(s.partsCost));
    p.stat('Teilesätze je Lieferung', (s) => fmtNum(s.partsPerDelivery));
    p.button('Teile bestellen', { type: 'buyParts' });
    p.button((s) => `Auto-Einkauf: ${s.flags.autoBuy ? 'an' : 'aus'}`, { type: 'toggleAutoBuy' }, {
      visible: (s) => s.flags.autoBuyAvailable,
    });
  },
});

export const plantsPanel = definePanel({
  id: 'plants',
  title: 'Anlagen',
  column: 1,
  visible: (s) => p1(s) && s.flags.robots,
  build(p) {
    const b = p.game.b;
    p.stat('Montageroboter', (s) => fmtNum(s.robots));
    p.button((s) => `Roboter kaufen (${fmtMoney(robotCost(s.robots, b))})`, { type: 'buyRobot' });
    p.group('sub', (s) => s.flags.lines, (g) => {
      g.stat('Fertigungsstraßen', (s) => fmtNum(s.lines));
      g.button((s) => `Straße kaufen (${fmtMoney(lineCost(s.lines, b))})`, { type: 'buyLine' });
    });
  },
});
