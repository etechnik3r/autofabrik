import { definePanel, h } from '../dom';
import { isScientific, setScientific } from '../format';

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

export const settingsPanel = definePanel({
  id: 'settings',
  title: 'System',
  column: 3,
  visible: () => true,
  build(p) {
    const status = h('p', 'hint');
    const say = (t: string) => {
      status.textContent = t;
    };
    p.group('row', undefined, (r) => {
      r.command('Speichern', () => {
        p.game.save();
        say('Gespeichert.');
      });
      r.command(
        () => (isScientific() ? 'Zahlen: 1,23·10^9' : 'Zahlen: 1,23 Mrd.'),
        () => {
          setScientific(!isScientific());
          storeSettings();
        },
      );
    });
    const area = p.add(h('textarea', 'io'));
    area.placeholder = 'Spielstand (Base64) zum Kopieren oder Einfügen';
    area.rows = 3;
    p.group('row', undefined, (r) => {
      r.command('Exportieren', () => {
        area.value = p.game.exportSave();
        area.select();
        say('Spielstand exportiert – jetzt kopieren.');
      });
      r.command('Importieren', () => say(p.game.importSave(area.value) ? 'Spielstand geladen.' : 'Ungültiger Spielstand.'));
      r.command(
        'Neues Spiel',
        () => {
          if (confirm('Wirklich neu anfangen? Der aktuelle Lauf geht verloren (Prestige bleibt).')) p.game.newGame();
        },
        'btn danger',
      );
    });
    p.add(status);
  },
});
