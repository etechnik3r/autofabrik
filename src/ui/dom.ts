import type { Action, GameState } from '../sim';
import { GLOSSARY } from './glossary';
import type { Game } from './game';

/** Ein Binder gleicht ein DOM-Detail mit dem Zustand ab. Er schreibt nur bei Änderung. */
export type Binder = (s: GameState) => void;
type Fn<T> = (s: GameState) => T;
type Val<T> = T | Fn<T>;

function val<T>(v: Val<T>, s: GameState): T {
  return typeof v === 'function' ? (v as Fn<T>)(s) : v;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function bindText(e: HTMLElement, fn: Fn<string>): Binder {
  let last: string | undefined;
  return (s) => {
    const t = fn(s);
    if (t !== last) e.textContent = last = t;
  };
}

export function bindVisible(e: HTMLElement, fn: Fn<boolean>): Binder {
  let last: boolean | undefined;
  return (s) => {
    const v = fn(s);
    if (v !== last) e.hidden = !(last = v);
  };
}

export interface ButtonOpts {
  visible?: Fn<boolean>;
  title?: Val<string>;
  cls?: string;
  /** Zusätzliche Bedingung neben canDo(). */
  enabled?: Fn<boolean>;
}

/**
 * Baukasten für ein Panel. Alle erzeugten Elemente registrieren Binder;
 * update() wertet sie gegen den aktuellen Zustand aus.
 */
export class Builder {
  constructor(
    readonly root: HTMLElement,
    readonly game: Game,
    readonly binders: Binder[] = [],
  ) {}

  add<T extends HTMLElement>(e: T, parent: HTMLElement = this.root): T {
    parent.appendChild(e);
    return e;
  }

  bind(b: Binder): void {
    this.binders.push(b);
  }

  /** Zeile „Beschriftung … Wert“. */
  stat(label: Val<string>, value: Fn<string>, visible?: Fn<boolean>): HTMLElement {
    const row = this.add(h('div', 'stat'));
    const l = row.appendChild(h('span', 'label'));
    const v = row.appendChild(h('span', 'value'));
    if (typeof label === 'function') this.bind(bindText(l, label));
    else {
      l.textContent = label;
      const info = GLOSSARY[label];
      if (info) {
        row.title = info;
        row.classList.add('has-info');
      }
    }
    this.bind(bindText(v, value));
    if (visible) this.bind(bindVisible(row, visible));
    return row;
  }

  text(fn: Val<string>, cls = 'text', visible?: Fn<boolean>): HTMLElement {
    const e = this.add(h('p', cls));
    if (typeof fn === 'function') this.bind(bindText(e, fn));
    else e.textContent = fn;
    if (visible) this.bind(bindVisible(e, visible));
    return e;
  }

  /** Button, der eine Aktion auslöst. Aktiv, wenn canDo() erlaubt. */
  button(label: Val<string>, action: Val<Action>, opts: ButtonOpts = {}): HTMLButtonElement {
    const btn = this.add(h('button', opts.cls ?? 'btn'));
    btn.type = 'button';
    btn.addEventListener('click', () => {
      this.game.dispatch(val(action, this.game.state));
    });
    let lastLabel: string | undefined;
    let lastDisabled: boolean | undefined;
    let lastTitle: string | undefined;
    this.bind((s) => {
      const l = val(label, s);
      if (l !== lastLabel) btn.textContent = lastLabel = l;
      const d = !(this.game.can(val(action, s)) && (opts.enabled?.(s) ?? true));
      if (d !== lastDisabled) btn.disabled = lastDisabled = d;
      if (opts.title) {
        const t = val(opts.title, s);
        if (t !== lastTitle) btn.title = lastTitle = t;
      }
    });
    if (opts.visible) this.bind(bindVisible(btn, opts.visible));
    return btn;
  }

  /** Button für UI-Befehle außerhalb der Simulation (Speichern, Export …). */
  command(label: Val<string>, onClick: () => void, cls = 'btn'): HTMLButtonElement {
    const btn = this.add(h('button', cls));
    btn.type = 'button';
    btn.addEventListener('click', onClick);
    if (typeof label === 'function') this.bind(bindText(btn, label));
    else btn.textContent = label;
    return btn;
  }

  /** Gruppe mit eigenem Container (z. B. Buttonzeile), teilt die Binder. */
  group(cls: string, visible?: Fn<boolean>, fill?: (g: Builder) => void): Builder {
    const e = this.add(h('div', cls));
    if (visible) this.bind(bindVisible(e, visible));
    const g = new Builder(e, this.game, this.binders);
    fill?.(g);
    return g;
  }

  /** Fortschrittsbalken 0..1 */
  bar(fn: Fn<number>, cls = 'bar'): HTMLElement {
    const outer = this.add(h('div', cls));
    const inner = outer.appendChild(h('div', 'fill'));
    let last = -1;
    this.bind((s) => {
      const v = Math.max(0, Math.min(1, fn(s)));
      if (Math.abs(v - last) > 0.002) {
        inner.style.width = `${(v * 100).toFixed(1)}%`;
        last = v;
      }
    });
    return outer;
  }

  heading(text: string): HTMLElement {
    return this.add(h('h3', 'sub', text));
  }
}

export interface PanelDef {
  id: string;
  title: Val<string>;
  column: 1 | 2 | 3;
  visible: Fn<boolean>;
  build(p: Builder): void;
}

export function definePanel(p: PanelDef): PanelDef {
  return p;
}
