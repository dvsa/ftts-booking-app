import { TestLanguage } from '../../../src/domain/test-language';
import { translate } from '../../../src/helpers/language';
import { Language, Target, TestType } from '../../../src/domain/enums';

describe('Test Language helper', () => {
  test('Creating a TestLanguage from an Unknown test language throws error', () => {
    expect(() => TestLanguage.from('unknownLanguage'))
      .toThrow(translate('testLanguage.validationError'));
  });

  test('Check if a language is available - available value', () => {
    const response = TestLanguage.isAvailableLanguage(Language.ENGLISH);

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
    const response = TestLanguage.isValid(Language.ENGLISH);

    expect(response).toBe(true);
  });

  test('Check if a language is valid - unavailable value', () => {
    expect(() => TestLanguage.isValid('unknownLanguage'))
      .toThrow(translate('testLanguage.validationError'));
  });

  describe('Check if a language can be changed', () => {
    test.each([
      TestType.CAR,
      TestType.MOTORCYCLE,
      TestType.LGVCPC,
      TestType.LGVCPCC,
      TestType.LGVHPT,
      TestType.LGVMC,
      TestType.PCVCPC,
      TestType.PCVCPCC,
      TestType.PCVHPT,
      TestType.PCVMC,
      TestType.TAXI,
    ])('%s test type booking is able to change language on GB service', (testType: TestType) => {
      const response = TestLanguage.canChangeTestLanguage(Target.GB, testType);

      expect(response).toBe(true);
    });

    test('returns false for changing language on NI service', () => {
      const response = TestLanguage.canChangeTestLanguage(Target.NI, TestType.CAR);

      expect(response).toBe(false);
    });

    test('returns false for changing language for ERS test type on instructor GB service', () => {
      const response = TestLanguage.canChangeTestLanguage(Target.GB, TestType.ERS);

      expect(response).toBe(false);
    });
  });
});
