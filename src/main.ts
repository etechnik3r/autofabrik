import './ui/styles.css';
import { mountApp } from './ui/app';
import { Game } from './ui/game';
import { loadSettings } from './ui/panels/settings';

function storage(): Storage | null {
  try {
    const s = window.localStorage;
    s.getItem('autofabrik.probe');
    return s;
  } catch {
    return null;
  }
}

loadSettings();
const game = new Game(storage());
mountApp(document.getElementById('app')!, game);
void game.start();
// Für die Konsole: window.game.state
(window as unknown as { game: Game }).game = game;
