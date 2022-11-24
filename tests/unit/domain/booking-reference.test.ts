import { BookingReference } from '../../../src/domain/booking/booking-reference';

describe('Booking reference', () => {
  describe('can be constructed', () => {
    describe('if valid', () => {
      const validInputs = [
        'B-000-037-220',
        'C-123-037-789',
        'Z-010-123-999',
      ];
      validInputs.forEach((input) => {
        test(`${input}`, () => {
          expect(BookingReference.isValid(input)).toBe(true);
        });
      });
    });

    test('if valid but contains spaces', () => {
      const validLicenceNumber = 'B- 000-037- 220';
      expect(BookingReference.isValid(validLicenceNumber)).toBe(true);
    });

    test('if valid but is in lower case', () => {
      const validLicenceNumber = 'b-000-037-220';
      expect(BookingReference.isValid(validLicenceNumber)).toBe(true);
    });
  });

  describe('cannot be constructed', () => {
    test('throws error if undefined', () => {
      expect(() => BookingReference.isValid(undefined)).toThrow();
    });

    test('throws error if empty', () => {
      expect(() => BookingReference.isValid('')).toThrow();
    });

    test('throws error if just whitespace', () => {
      expect(() => BookingReference.isValid('  ')).toThrow();
    });

    describe('throws error if invalid', () => {
      const invalidInputs = [
        'invalid',
        'B-000-037-220-01',
        'B-000-037-1234',
        'B-0001-037-220',
        'B000037220',
        'AB-000-037-220',
      ];
      invalidInputs.forEach((input) => {
        test(`${input}`, () => {
          expect(() => BookingReference.isValid(input)).toThrow();
        });
      });
    });
  });
});
