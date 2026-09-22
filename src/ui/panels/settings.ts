import { Builder, h } from '../dom';
import { isScientific, setScientific } from '../format';
import type { Game } from '../game';

const SETTINGS_KEY = 'autofabrik.settings';

export function loadSettings(): void {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    setScientific(!!s.scientific);
  } catch {
    /* Standardwerte */
  }
}

function storeSettings(): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ scientific: isScientific() }));
  } catch {
    /* ohne Speicher weiter */
  }
}

/**
 * Inhalt des Einstellungsmenüs (Zahnrad im Kopfbereich): Speichern läuft ohnehin automatisch
 * im Hintergrund (localStorage, zwei Slots) – hier stehen nur Anzeige, Ein-/Ausgabe und der
 * Rücksetzen-Knopf. `close` blendet das Menü nach einer Aktion wieder aus.
 */
export function buildSettings(builder: Builder, game: Game, close: () => void): void {
  const status = builder.add(h('p', 'hint'));
  const say = (t: string) => {
    status.textContent = t;
  };

  builder.text('Der Spielstand wird laufend automatisch im Browser gespeichert (localStorage) und beim Öffnen fortgesetzt.', 'hint');

  builder.command(() => (isScientific() ? 'Zahlen: 1,23·10^9' : 'Zahlen: 1,23 Mrd.'), () => {
    setScientific(!isScientific());
    storeSettings();
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
