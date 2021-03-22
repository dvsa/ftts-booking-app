import { BirthMonth } from '../../../../src/pages/details/birth-month';
import { BirthYear } from '../../../../src/pages/details/birth-year';

describe('Birth Month', () => {
  const y2000 = new BirthYear('2000');

  test('is always between 1 and 12', () => {
    expect(() => new BirthMonth('0', y2000)).toThrow();
    expect(() => new BirthMonth('13', y2000)).toThrow();
    expect(new BirthMonth('1', y2000)).toBeTruthy();
    expect(new BirthMonth('12', y2000)).toBeTruthy();
  });

  test('is a number', () => {
    expect(() => new BirthMonth('not an number', y2000)).toThrow();
    expect(() => new BirthMonth('', y2000)).toThrow();
  });
});
