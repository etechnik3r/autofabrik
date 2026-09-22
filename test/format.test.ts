import { afterEach, describe, expect, it } from 'vitest';
import { fmtMoney, fmtNum, fmtTime, setScientific } from '../src/ui/format';

describe('Formatierung (1.5/1.6)', () => {
  afterEach(() => setScientific(false));

  it('Geld in k∈, ab 1 000 k∈ in Mio./Mrd. ∈', () => {
    expect(fmtMoney(25)).toBe('25 k∈');
    expect(fmtMoney(999)).toBe('999 k∈');
    expect(fmtMoney(2510)).toBe('2,51 Mio. ∈');
    expect(fmtMoney(1_380_000)).toBe('1,38 Mrd. ∈');
  });

  it('große Zahlen mit Namen oder wissenschaftlich', () => {
    expect(fmtNum(123456)).toBe('123.456');
    expect(fmtNum(6e27)).toBe('6,00 Quadrd.');
    expect(fmtNum(3e55)).toBe('30,00 Nonio.');
    setScientific(true);
    expect(fmtNum(6e27)).toBe('6,00·10^27');
  });

  it('Spielzeit', () => {
    expect(fmtTime(65)).toBe('1:05');
    expect(fmtTime(3725)).toBe('1:02:05');
  });
});
