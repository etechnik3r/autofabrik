/**
 * Cheat-Zone: reine Test-/Vorschau-Werkzeuge (Einstellungen → „Cheat-Zone“), kein normales
 * Spiel-Feature. Absichtlich nicht in GameState, damit es nicht Teil des Spielstands wird.
 */
let previewLocked = false;

export function setPreviewLocked(on: boolean): void {
  previewLocked = on;
}

export function isPreviewLocked(): boolean {
  return previewLocked;
}
