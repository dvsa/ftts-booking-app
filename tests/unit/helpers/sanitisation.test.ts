import { convertNullUndefinedToEmptyString } from '../../../src/helpers/sanitisation';

describe('Sanitisation', () => {
  test('convert nulls to string', () => {
    const result = convertNullUndefinedToEmptyString(null);

    expect(result).toBe('');
  });

  test('convert undefined to string', () => {
    const result = convertNullUndefinedToEmptyString(undefined);

    expect(result).toBe('');
  });

  test('text is not manipulated', () => {
    const result = convertNullUndefinedToEmptyString('test');

    expect(result).toBe('test');
  });

  test('empty string with spaces is not manipulated', () => {
    const result = convertNullUndefinedToEmptyString('  ');

    expect(result).toBe('  ');
  });
});
