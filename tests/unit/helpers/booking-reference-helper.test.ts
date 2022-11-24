import { isEqualBookingRefs, normaliseBookingRef } from '../../../src/helpers/booking-reference-helper';

describe('Booking reference helper', () => {
  describe('normaliseBookingRef()', () => {
    test('When normaliseBookingRef() is triggered on a reference, that reference is put in lower case and striped of every spaces', () => {
      expect(normaliseBookingRef(' B - 000 - 000 - 001')).toEqual('b-000-000-001');
    });
    test('When normaliseBookingRef() is triggered on a null value, it returns null', () => {
      expect(normaliseBookingRef(null)).toBeNull();
    });
    test('When normaliseBookingRef() is triggered on an undefined value, it returns undefined', () => {
      expect(normaliseBookingRef(undefined)).toBeUndefined();
    });
  });

  describe('isEqualBookingRefs()', () => {
    test('When two references are differing only in case and/or spaces, isEqualBookingRefs() returns true', () => {
      expect(isEqualBookingRefs('B-000-000-001', 'b- 000 -000-001')).toBe(true);
    });
    test('When two references are differing in anything else than case and spaces, isEqualBookingRefs() returns false', () => {
      expect(isEqualBookingRefs('B-000-000-001', 'B 000-000-001')).toBe(false);
    });
    test('When one of the two references is null, isEqualBookingRefs() returns false', () => {
      expect(isEqualBookingRefs('B-000-000-001', null)).toBe(false);
    });
    test('When one of the two references is undefined, isEqualBookingRefs() returns false', () => {
      expect(isEqualBookingRefs('B-000-000-001', undefined)).toBe(false);
    });
    test('When the two references are null, isEqualBookingRefs() returns false', () => {
      expect(isEqualBookingRefs(null, null)).toBe(false);
    });
    test('When the two references are undefined, isEqualBookingRefs() returns false', () => {
      expect(isEqualBookingRefs(undefined, undefined)).toBe(false);
    });
  });
});
