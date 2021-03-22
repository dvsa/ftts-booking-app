import { clamp } from '../../../src/helpers/math-helper';

describe('Math Helper Tests', () => {
  test('clamps minimum value', () => {
    const value = 2;

    const clamped = clamp(value, 5, 10);

    expect(clamped).toEqual(5);
  });

  test('clamps maximum value', () => {
    const value = 12;

    const clamped = clamp(value, 5, 10);

    expect(clamped).toEqual(10);
  });

  test('does not affect value within boundary', () => {
    const value = 7;

    const clamped = clamp(value, 5, 10);

    expect(clamped).toEqual(7);
  });

  test('incorrect range is clamped to minimum value', () => {
    const value = 20;

    const clamped = clamp(value, 10, 5);

    expect(clamped).toEqual(5);
  });
});
