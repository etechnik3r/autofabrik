import type { PanelDef } from '../dom';
import { computePanel, projectsPanel } from './compute';
import { assemblyPanel, plantsPanel, purchasingPanel, salesPanel } from './phase1';
import { corporationPanel, fleetPanel, powerPanel } from './phase2';
import { conflictPanel, expansionPanel, shipDesignPanel } from './phase3';
import { settingsPanel } from './settings';
import { quantumPanel, strategyPanel, treasuryPanel } from './systems';

/** Reihenfolge = Reihenfolge innerhalb der Spalte (Kap. 10). */
export const panels: PanelDef[] = [
  assemblyPanel,
  salesPanel,
  purchasingPanel,
  plantsPanel,
  corporationPanel,
  powerPanel,
  computePanel,
  fleetPanel,
  quantumPanel,
  projectsPanel,
  treasuryPanel,
  strategyPanel,
  expansionPanel,
  shipDesignPanel,
  conflictPanel,
  settingsPanel,
];
