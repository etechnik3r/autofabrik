/** Zahlenformatierung (Spec 1.5/1.6). Deutsche Kurznamen oder wissenschaftlich, umschaltbar. */

const NAMES = [
  '',
  'Tsd.',
  'Mio.',
  'Mrd.',
  'Bio.',
  'Brd.',
  'Trio.',
  'Trd.',
  'Quadrio.',
  'Quadrd.',
  'Quintio.',
  'Quintd.',
  'Sextio.',
  'Sextd.',
  'Septio.',
  'Septd.',
  'Oktio.',
  'Oktd.',
  'Nonio.',
  'Nond.',
  'Dezio.',
  'Dezd.',
];

let scientific = false;

export function setScientific(on: boolean): void {
  scientific = on;
}

export function isScientific(): boolean {
  return scientific;
}

const int = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const dec2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dec1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

/** Große Zahl: bis 10⁶ ausgeschrieben, darüber mit Namen oder wissenschaftlich. */
export function fmtNum(x: number): string {
  if (!Number.isFinite(x)) return '∞';
  const a = Math.abs(x);
  if (a < 1e6) return int.format(Math.floor(x));
  if (scientific) return x.toExponential(2).replace('.', ',').replace('e+', '·10^');
  const group = Math.floor(Math.log10(a) / 3);
  if (group >= NAMES.length) return x.toExponential(2).replace('.', ',').replace('e+', '·10^');
  return `${dec2.format(x / Math.pow(10, group * 3))} ${NAMES[group]}`;
}

/** Kleine Werte mit einer Nachkommastelle, große wie fmtNum. */
export function fmtRate(x: number): string {
  return Math.abs(x) < 100 ? dec1.format(x) : fmtNum(x);
}

/** Geld: intern k∈ (Spec 1.5). */
export function fmtMoney(k: number): string {
  if (Math.abs(k) < 1000) return `${int.format(Math.floor(k))} k∈`;
  return `${fmtNum(k * 1000)} ∈`;
}

export function fmtPct(x: number, digits = 0): string {
  return `${x.toLocaleString('de-DE', { maximumFractionDigits: digits, minimumFractionDigits: digits })} %`;
}

/** Spielzeit hh:mm:ss */
export function fmtTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${m}:${pad(r)}`;
}
