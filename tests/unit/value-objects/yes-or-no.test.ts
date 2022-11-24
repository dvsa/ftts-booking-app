import { YesOrNo } from '../../../src/value-objects/yes-or-no';

describe('Yes or No processor', () => {
  const yes = 'yes';
  const no = 'no';
  const invalid = 'invalid';

  test('Yes from string', () => {
    const actual = YesOrNo.from(yes);

    expect(actual.toString()).toBe(yes);
  });

  test('Yes from boolean', () => {
    const actual = YesOrNo.fromBoolean(true);

    expect(actual.toString()).toBe(yes);
  });

  test('No from string', () => {
    const actual = YesOrNo.from(no);

    expect(actual.toString()).toBe(no);
  });

  test('No from boolean', () => {
    const actual = YesOrNo.fromBoolean(false);

    expect(YesOrNo.isValid(yes)).toBeTruthy();
    expect(actual.toString()).toBe(no);
  });

  test('invalid string', () => {
    expect(() => YesOrNo.from(invalid)).toThrow(TypeError('Please choose yes or no.'));
  });

  test('invalid object', () => {
    expect(() => YesOrNo.fromBoolean({})).toThrow(TypeError('The value provided is not of type boolean.'));
  });
});
