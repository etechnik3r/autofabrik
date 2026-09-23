import { Builder, h } from '../dom';
import { isScientific, setScientific } from '../format';
import { MAX_SPEED, MIN_SPEED, type Game } from '../game';
import { applyTheme, isThemeId, THEMES, type ThemeId } from '../theme';

const SETTINGS_KEY = 'autofabrik.settings';

interface Settings {
  scientific: boolean;
  theme: ThemeId;
}

function readSettings(): Settings {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return { scientific: !!s.scientific, theme: typeof s.theme === 'string' && isThemeId(s.theme) ? s.theme : 'system' };
  } catch {
    return { scientific: false, theme: 'system' };
  }
}

function writeSettings(patch: Partial<Settings>): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), ...patch }));
  } catch {
    /* ohne Speicher weiter */
  }
}

/** Beim Start aufrufen: Zahlenformat und Farbschema aus dem vorigen Besuch übernehmen. */
export function loadSettings(): void {
  const s = readSettings();
  setScientific(s.scientific);
  applyTheme(s.theme);
}

/**
 * Inhalt des Einstellungsmenüs (Zahnrad im Kopfbereich): Speichern läuft ohnehin automatisch
 * im Hintergrund (localStorage, zwei Slots) – hier stehen nur Anzeige, Farbschema, Ein-/Ausgabe,
 * ein Entwicklermodus zum schnellen Testen und der Rücksetzen-Knopf.
 */
export function buildSettings(builder: Builder, game: Game, close: () => void): void {
  const status = builder.add(h('p', 'hint'));
  const say = (t: string) => {
    status.textContent = t;
  };

  builder.text('Der Spielstand wird laufend automatisch im Browser gespeichert (localStorage) und beim Öffnen fortgesetzt.', 'hint');

  builder.heading('Farbschema');
  const themeSelect = builder.add(h('select', 'select'));
  for (const t of THEMES) themeSelect.appendChild(new Option(t.label, t.id));
  themeSelect.value = readSettings().theme;
  themeSelect.addEventListener('change', () => {
    const id = themeSelect.value;
    if (isThemeId(id)) {
      applyTheme(id);
      writeSettings({ theme: id });
    }
  });

  builder.command(() => (isScientific() ? 'Zahlen: 1,23·10^9' : 'Zahlen: 1,23 Mrd.'), () => {
    setScientific(!isScientific());
    writeSettings({ scientific: isScientific() });
  });

  builder.heading('Spielstand austauschen');
  const area = builder.add(h('textarea', 'io'));
  area.placeholder = 'Spielstand (Base64) zum Kopieren oder Einfügen';
  area.rows = 3;
  builder.group('row', undefined, (r) => {
    r.command('Exportieren', () => {
      area.value = game.exportSave();
      area.select();
      say('Spielstand exportiert – jetzt kopieren.');
    });
    r.command('Importieren', () => say(game.importSave(area.value) ? 'Spielstand geladen.' : 'Ungültiger Spielstand.'));
  });

  builder.heading('Geschwindigkeit');
  builder.text(
    `Nur bei ×${MIN_SPEED} läuft wirklich ein „echtes“ Spiel. Höhere Werte beschleunigen die Simulation testweise, um die Mechanik schnell durchzuklicken – gedacht zum Testen, nicht zum eigentlichen Spielen.`,
    'hint',
  );
  const speedRow = builder.add(h('label', 'slider'));
  speedRow.append(`×${MIN_SPEED}`);
  const speedInput = speedRow.appendChild(document.createElement('input'));
  speedRow.append(`×${MAX_SPEED}`);
  speedInput.type = 'range';
  speedInput.min = String(MIN_SPEED);
  speedInput.max = String(MAX_SPEED);
  speedInput.step = '1';
  speedInput.value = String(game.speed);
  speedInput.addEventListener('input', () => void (game.speed = Number(speedInput.value)));
  const speedLabel = builder.add(h('p', 'hint'));
  builder.bind(() => {
    if (document.activeElement !== speedInput) speedInput.value = String(game.speed);
    speedLabel.textContent =
      game.speed === MIN_SPEED ? `Aktuell: ×${MIN_SPEED} (echtes Spieltempo)` : `Aktuell: ×${game.speed} (Testmodus, kein echtes Spieltempo)`;
  });

  builder.heading('Zurücksetzen');
  builder.command(
    'Spielstand zurücksetzen',
    () => {
      if (confirm('Spielstand wirklich zurücksetzen? Der aktuelle Lauf geht unwiderruflich verloren (Prestige bleibt erhalten).')) {
        game.newGame();
        close();
      }
    },
    'btn danger',
  );

  builder.add(status);
}
