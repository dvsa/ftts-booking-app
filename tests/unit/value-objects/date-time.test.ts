import { DateTime } from '../../../src/value-objects/date-time';

describe('DateTime Class', () => {
  const valid = '2022-10-10T01:00:00.000Z';
  const invalid = '2022-13-10T01:00:00.000Z';
  let instance;

  test('can get process valid date', () => {
    instance = DateTime.from(valid);
    const actual = instance.toString();

    expect(actual).toBeTruthy();
  });

  test('can get handle invalid date', () => {
    expect(() => DateTime.from(invalid)).toThrow(new TypeError('This is not a valid format for a timestamp'));
  });
});
