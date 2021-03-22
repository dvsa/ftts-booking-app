import { BirthYear } from '../../../../src/pages/details/birth-year';

describe('Birth Year', () => {
  test(`is never less than ${BirthYear.min}`, () => {
    expect(() => new BirthYear((BirthYear.min - 1).toString())).toThrow();
    expect(new BirthYear(BirthYear.min.toString())).toBeTruthy();
  });

  test(`is never more than 15 years ago (${BirthYear.max})`, () => {
    expect(() => new BirthYear('2100')).toThrow();
    expect(() => new BirthYear((BirthYear.max + 1).toString())).toThrow();
    expect(new BirthYear(BirthYear.max.toString())).toBeTruthy();
  });

  test('is a number', () => {
    expect(() => new BirthYear('not an number')).toThrow();
    expect(() => new BirthYear('')).toThrow();
  });
});
