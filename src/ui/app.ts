import type { GameState } from '../sim';
import { playSeconds } from '../sim/state';
import { Builder, h, type Binder, type PanelDef } from './dom';
import { fmtNum, fmtTime } from './format';
import type { Game } from './game';
import { PANEL_ICONS } from './icons';
import { panels } from './panels';
import { buildSettings } from './panels/settings';

const GEAR_ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

const PHASE_NAMES = ['', 'Manufaktur', 'Konzern', 'Expansion'];

interface Mounted {
  def: PanelDef;
  el: HTMLElement;
  titleText: HTMLElement;
  binders: Binder[];
  shown: boolean;
}

/** Baut die Seite auf und rendert per requestAnimationFrame. */
export function mountApp(root: HTMLElement, game: Game): void {
  const header = root.appendChild(h('header', 'top'));
  const brand = header.appendChild(h('div', 'brand'));
  brand.appendChild(h('h1', undefined, 'AUTOFABRIK'));
  const phase = brand.appendChild(h('span', 'phase'));
  const carsEl = header.appendChild(h('div', 'cars'));
  carsEl.appendChild(h('span', 'label', 'Autos gebaut'));
  const carsValue = carsEl.appendChild(h('span', 'big'));
  const ticker = header.appendChild(h('ol', 'ticker'));

  const gearWrap = header.appendChild(h('div', 'gear-wrap'));
  const gearBtn = gearWrap.appendChild(h('button', 'gear-btn'));
  gearBtn.type = 'button';
  gearBtn.title = 'Einstellungen';
  gearBtn.setAttribute('aria-label', 'Einstellungen');
  gearBtn.innerHTML = GEAR_ICON;
  const settingsMenu = gearWrap.appendChild(h('div', 'settings-menu'));
  settingsMenu.hidden = true;
  const closeSettings = () => {
    settingsMenu.hidden = true;
  };
  gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.hidden = !settingsMenu.hidden;
  });
  settingsMenu.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', closeSettings);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeSettings());
  const settingsBuilder = new Builder(settingsMenu, game);
  buildSettings(settingsBuilder, game, closeSettings);

  const main = root.appendChild(h('main', 'columns'));
  const cols = [1, 2, 3].map(() => main.appendChild(h('div', 'col')));

  const mounted: Mounted[] = panels.map((def) => {
    const el = cols[def.column - 1].appendChild(h('section', 'panel'));
    el.dataset.panel = def.id;
    const title = el.appendChild(h('h2'));
    const icon = PANEL_ICONS[def.id];
    if (icon) title.appendChild(h('span', 'picon', icon));
    const titleText = title.appendChild(h('span', 'ptext'));
    const body = el.appendChild(h('div', 'body'));
    const builder = new Builder(body, game);
    def.build(builder);
    el.hidden = true;
    return { def, el, titleText, binders: builder.binders, shown: false };
  });

  const overlay = root.appendChild(h('div', 'overlay'));
  overlay.hidden = true;
  const overlayText = overlay.appendChild(h('p'));
  const overlayBar = overlay.appendChild(h('div', 'bar'));
  const overlayFill = overlayBar.appendChild(h('div', 'fill'));
  game.onCatchUp = (p) => {
    overlay.hidden = !p;
    if (p) {
      overlayText.textContent = `Fabrik lief weiter … ${fmtTime((p.done * game.b.tick.fastMs) / 1000)} von ${fmtTime((p.total * game.b.tick.fastMs) / 1000)} nachgeholt`;
      overlayFill.style.width = `${((p.done / p.total) * 100).toFixed(1)}%`;
    }
  };

  const credits = root.appendChild(h('div', 'overlay credits'));
  credits.hidden = true;
  credits.innerHTML = `<h2>Das Fließband steht still.</h2><p>Alle Materie ist verbaut. Das letzte Auto wurde von Hand montiert.</p><p class="hint">AUTOFABRIK – nach der Mechanik von Universal Paperclips (Frank Lantz, 2017).</p>`;

  let tickerKey = '';
  const renderHeader = (s: GameState) => {
    phase.textContent = `Phase ${s.phase} · ${PHASE_NAMES[s.phase]} · ${fmtTime(playSeconds(s, game.b))}`;
    carsValue.textContent = fmtNum(s.cars);
    const last = s.messages.slice(-5).reverse();
    const key = last.map((m) => m.tick).join(',') + s.messages.length;
    if (key !== tickerKey) {
      tickerKey = key;
      ticker.innerHTML = '';
      for (const m of last) {
        const li = ticker.appendChild(h('li'));
        li.appendChild(h('time', undefined, fmtTime((m.tick * game.b.tick.fastMs) / 1000)));
        li.appendChild(h('span', undefined, m.text));
      }
    }
    credits.hidden = !s.flags.credits;
  };

  const frame = () => {
    const s = game.state;
    renderHeader(s);
    for (const b of settingsBuilder.binders) b(s);
    for (const m of mounted) {
      const show = m.def.visible(s);
      if (show !== m.shown) {
        m.el.hidden = !show;
        m.shown = show;
        if (show) m.el.classList.add('appear');
      }
      if (!show) continue;
      const t = typeof m.def.title === 'function' ? m.def.title(s) : m.def.title;
      if (m.titleText.textContent !== t) m.titleText.textContent = t;
      for (const b of m.binders) b(s);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
