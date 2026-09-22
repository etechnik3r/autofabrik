import raw from '../../data/balance.json';

/** Alle Konstanten des Spiels (Anhang B). Tests dürfen eine veränderte Kopie übergeben. */
export type Balance = typeof raw;

export const defaultBalance: Balance = raw;
