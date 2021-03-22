import { LicenceNumber } from '../../../../src/domain/licence-number';
import { UtcDate } from '../../../../src/domain/utc-date';
import { Entitlements } from '../../../../src/pages/details/entitlements';
import { Licence } from '../../../../src/pages/details/licence';
import { TheoryTest } from '../../../../src/pages/details/theory-test';
import { TheoryTests } from '../../../../src/pages/details/theory-tests';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'testType.validationError',
}));

function wendyJonesWith(entitlements: Entitlements): Licence {
  return new Licence(
    LicenceNumber.of('JONES061102W97YT'),
    'WENDY',
    'JONES',
    UtcDate.of('2002-11-10'),
    entitlements,
  );
}

describe('Theory Tests', () => {
  const car: TheoryTest = TheoryTest.of('Car');
  const motorcycle: TheoryTest = TheoryTest.of('Motorcycle');

  describe('for a Driver', () => {
    const all: TheoryTests = new TheoryTests([car, motorcycle]);

    test('with no full entitlements can take all tests', () => {
      const available: TheoryTests = all.availableTo(wendyJonesWith(Entitlements.of('')));

      expect(available).toEqual(all);
    });

    test('with full entitlements can take no tests', () => {
      const available: TheoryTests = all.availableTo(wendyJonesWith(Entitlements.of('B,A')));

      expect(available.get().length).toBe(0);
    });

    test('with just a bike entitlement can take car test', () => {
      const available: TheoryTests = all.availableTo(wendyJonesWith(Entitlements.of('A')));

      expect(available).toEqual(new TheoryTests([car]));
    });

    test('with just a car entitlement can take motorcycle test', () => {
      const available: TheoryTests = all.availableTo(wendyJonesWith(Entitlements.of('B')));

      expect(available).toEqual(new TheoryTests([motorcycle]));
    });
  });

  describe('isValid', () => {
    test('should throw an error if value is undefined', () => {
      try {
        TheoryTest.isValid(undefined);
      } catch (e) {
        expect(e.message).toEqual('testType.validationError');
        expect(e instanceof TypeError).toBe(true);
      }
    });

    test('should return true if the value is valid', () => {
      expect(TheoryTest.isValid('Car')).toBe(true);
    });
  });

  test('are described correctly', () => {
    expect(car.toString()).toBe('Car');
    expect(motorcycle.toString()).toBe('Motorcycle');
    expect(car.description()).toBe('Car category B/B auto');
    expect(motorcycle.description()).toBe('Motorcycle category AM/A1/A2/A');
  });
});
