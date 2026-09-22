import type { Balance, GameState } from '../../src/sim';

/** Ein Bot wird jeden Fast-Tick gefragt und darf über dispatch() handeln. */
export interface Bot {
  name: string;
  act(s: GameState, b: Balance): void;
}
