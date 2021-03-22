import { TestLanguage } from '../../../src/domain/test-language';
import { translate } from '../../../src/helpers/language';
import { LANGUAGE } from '../../../src/domain/enums';

describe('Test Language helper', () => {
  test('Creating a TestLanguage from an Unknown test language throws error', () => {
    expect(() => TestLanguage.from('unknownLanguage'))
      .toThrowError(translate('testLanguage.validationError'));
  });

  test('Check if a language is available - available value', () => {
    const response = TestLanguage.isAvailableLanguage(LANGUAGE.ENGLISH);

    expect(response).toBe(true);
  });

  test('Check if a language is available - unavailable value', () => {
    const response = TestLanguage.isAvailableLanguage('unknownLanguage');

    expect(response).toBe(false);
  });

  test('Check if a language is available - null value', () => {
    const response = TestLanguage.isAvailableLanguage(null);

    expect(response).toBe(false);
  });

  test('Check if a language is valid - available value', () => {
    const response = TestLanguage.isValid(LANGUAGE.ENGLISH);

    expect(response).toBe(true);
  });

  test('Check if a language is valid - unavailable value', () => {
    expect(() => TestLanguage.isValid('unknownLanguage'))
      .toThrowError(translate('testLanguage.validationError'));
  });
});
