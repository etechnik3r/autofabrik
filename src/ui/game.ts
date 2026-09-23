import { canDo, createState, defaultBalance, dispatch, fastTick, replaceState, type Action, type Balance, type GameState } from '../sim';
import { randomSeed } from '../sim/rng';
import { exportString, importString, loadGame, loadPrestige, saveGame, type KeyValueStore } from '../save/save';

const AUTOSAVE_MS = 25_000;
/** Höchstens so viele Ticks pro Aufruf im Echtzeitbetrieb; der Rest wird im nächsten Aufruf nachgeholt. */
const MAX_TICKS_PER_FRAME = 2_000;
/** Ab so viel Rückstand wird im Schnelllauf mit Fortschrittsanzeige nachgeholt. */
const CATCH_UP_THRESHOLD_MS = 60_000;
const CATCH_UP_CHUNK = 25_000;

// GESCHWINDIGKEITSREGLER – nur zum schnellen Durchklicken der Mechanik beim Testen, kein
// eigentliches Spiel-Feature. Bewusst nicht gespeichert (steht nach einem Neuladen wieder auf
// ×1). Vor einem Release kann dieser Block inklusive des Reglers in settings.ts ersatzlos
// entfernt werden.
export const MIN_SPEED = 1;
export const MAX_SPEED = 60;

export interface CatchUpProgress {
  done: number;
  total: number;
}

/**
 * Browser-Treiber: hält den Zustand, rechnet Echtzeit in Fast-Ticks um (Fixed Timestep),
 * speichert automatisch und holt Offline-Zeit nach.
 */
export class Game {
  readonly b: Balance = defaultBalance;
  readonly state: GameState;
  private acc = 0;
  private last = 0;
  private lastSave = 0;
  private catchingUp = false;
  /** Offline-Zeit seit dem letzten Speichern, wird beim Start nachgeholt. */
  private pendingOfflineMs = 0;
  onCatchUp: ((p: CatchUpProgress | null) => void) | null = null;
  /** GESCHWINDIGKEITSREGLER (×1–×60), siehe Konstanten oben. Absichtlich nicht persistiert. */
  speed = MIN_SPEED;

  constructor(private readonly store: KeyValueStore | null) {
    const loaded = store ? loadGame(store, this.b) : null;
    this.state = loaded?.state ?? createState(this.b, randomSeed(), (store && loadPrestige(store)) || undefined);
    this.pendingOfflineMs = loaded ? Math.max(0, Date.now() - loaded.timestamp) : 0;
  }

  get busy(): boolean {
    return this.catchingUp;
  }

  can(a: Action): boolean {
    return !this.catchingUp && canDo(this.state, this.b, a);
  }

  dispatch(a: Action): boolean {
    if (this.catchingUp) return false;
    return dispatch(this.state, this.b, a);
  }

  async start(): Promise<void> {
    this.last = performance.now();
    this.lastSave = this.last;
    if (this.pendingOfflineMs > 0) {
      const maxMs = this.b.tick.offlineMaxHours * 3600_000;
      await this.catchUp(Math.min(this.pendingOfflineMs, maxMs));
      this.pendingOfflineMs = 0;
    }
    setInterval(() => this.pump(), 20);
    const saveNow = () => this.save();
    document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && saveNow());
    window.addEventListener('pagehide', saveNow);
  }

  /** Echtzeit → Ticks. Läuft auch in gedrosselten Hintergrund-Tabs (dann seltener, mit Nachholen). */
  private pump(): void {
    if (this.catchingUp) return;
    const now = performance.now();
    this.acc += now - this.last;
    this.last = now;
    if (this.acc > CATCH_UP_THRESHOLD_MS) {
      const ms = this.acc;
      this.acc = 0;
      void this.catchUp(ms);
      return;
    }
    const dt = this.b.tick.fastMs;
    // Die Echtzeit-Buchhaltung (acc) bleibt unangetastet, damit die Offline-Erkennung oben
    // korrekt funktioniert. Der Regler führt pro „realer“ Zeitscheibe nur mehr Ticks aus.
    const slots = Math.min(Math.floor(this.acc / dt), MAX_TICKS_PER_FRAME);
    this.acc -= slots * dt;
    let n = slots * this.speed;
    while (n-- > 0) fastTick(this.state, this.b);
    if (now - this.lastSave > AUTOSAVE_MS) this.save();
  }

  /** Schnelllauf ohne Rendering, in Blöcken, damit die Seite bedienbar bleibt. */
  async catchUp(ms: number): Promise<void> {
    const total = Math.floor(ms / this.b.tick.fastMs);
    if (total <= 0) return;
    this.catchingUp = true;
    let done = 0;
    while (done < total) {
      const n = Math.min(CATCH_UP_CHUNK, total - done);
      for (let k = 0; k < n; k++) fastTick(this.state, this.b);
      done += n;
      this.onCatchUp?.({ done, total });
      await new Promise((r) => setTimeout(r, 0));
    }
    this.catchingUp = false;
    this.last = performance.now();
    this.onCatchUp?.(null);
    this.save();
  }

  save(): void {
    if (!this.store) return;
    try {
      saveGame(this.store, this.state, Date.now(), this.b);
      this.lastSave = performance.now();
    } catch (e) {
      console.warn('Speichern fehlgeschlagen', e);
    }
  }

  exportSave(): string {
    return exportString(this.state, Date.now());
  }

  importSave(text: string): boolean {
    const loaded = importString(text, this.b);
    if (!loaded) return false;
    replaceState(this.state, loaded.state);
    this.save();
    return true;
  }

  newGame(): void {
    replaceState(this.state, createState(this.b, randomSeed(), this.state.prestige));
    this.save();
  }
}
