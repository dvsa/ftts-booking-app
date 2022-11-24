import {
  hasBehaviouralMarkerForTest,
  isBookable,
  isInstructorBookable,
  isZeroCostTest,
} from '../../../src/domain/eligibility';
import { Target, TestType } from '../../../src/domain/enums';
import { Eligibility } from '../../../src/domain/types';

describe('Eligibility domain helper', () => {
  const mockPRN = '123456';

  describe('isBookable', () => {
    test('returns true if the given eligibility item is bookable online', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.CAR,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      };

      const result = isBookable(mockEligibility, Target.GB);

      expect(result).toBe(true);
    });

    test('returns false given an ineligible test type', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.LGVCPC,
        eligible: false,
      };

      const result = isBookable(mockEligibility, Target.GB);

      expect(result).toBe(false);
    });

    test('returns false given a test type that can\t be booked online', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.ADIP1,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      };

      const result = isBookable(mockEligibility, Target.GB);

      expect(result).toBe(false);
    });

    test('returns false given eligible from is in the future', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.ADIP1,
        eligible: true,
        eligibleFrom: '2030-01-01',
        eligibleTo: '2030-01-01',
      };

      const result = isBookable(mockEligibility, Target.GB);

      expect(result).toBe(false);
    });

    test('returns false given eligible to is in the past', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.ADIP1,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2020-01-01',
      };

      const result = isBookable(mockEligibility, Target.GB);

      expect(result).toBe(false);
    });

    test('with GB target, returns false given a DVA-only test type', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.TAXI,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      };

      const result = isBookable(mockEligibility, Target.GB);

      expect(result).toBe(false);
    });

    test('with NI target, returns true given a DVA-only test type', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.TAXI,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      };

      const result = isBookable(mockEligibility, Target.NI);

      expect(result).toBe(true);
    });
  });

  describe('isInstructorBookable', () => {
    test('returns true if the given eligibility item is bookable online', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.ADIP1,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
        personalReferenceNumber: mockPRN,
      };

      const result = isInstructorBookable(mockEligibility, Target.GB);

      expect(result).toBe(true);
    });

    test('returns false given an ineligible test type', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.ADIP1,
        personalReferenceNumber: mockPRN,
        eligible: false,
      };

      const result = isInstructorBookable(mockEligibility, Target.GB);

      expect(result).toBe(false);
    });

    test('returns false given a test type that can\t be booked as an instructor', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.CAR,
        eligible: true,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      };

      const result = isInstructorBookable(mockEligibility, Target.GB);

      expect(result).toBe(false);
    });
  });

  describe('hasBehaviouralMarkerForTest', () => {
    test('returns false if behavioural marker is false', () => {
      const result = hasBehaviouralMarkerForTest('2021-05-01', false);

      expect(result).toBe(false);
    });

    test('returns true for test date when behavioural marker is active', () => {
      const result = hasBehaviouralMarkerForTest('2021-05-01', true, '2021-06-02');

      expect(result).toBe(true);
    });

    test('returns true for test date is day before when behavioural marker expires', () => {
      const result = hasBehaviouralMarkerForTest('2021-05-01', true, '2021-05-02');

      expect(result).toBe(true);
    });

    test('returns false for test date when behavioural marker expires', () => {
      const result = hasBehaviouralMarkerForTest('2021-05-01', true, '2021-05-01');

      expect(result).toBe(false);
    });

    test('returns false for when test date is after behavioural marker expires', () => {
      const result = hasBehaviouralMarkerForTest('2021-05-01', true, '2021-04-01');

      expect(result).toBe(false);
    });

    test('returns true if the given test type is ERS and does not have eligibleFrom and eligibleTo', () => {
      const mockEligibility: Eligibility = {
        testType: TestType.ERS,
        eligible: true,
        personalReferenceNumber: mockPRN,
      };

      const result = isInstructorBookable(mockEligibility, Target.GB);

      expect(result).toBeTruthy();
    });
  });

  describe('isZeroCostTest', () => {
    test.each([
      [true, TestType.ADIP1DVA],
      [true, TestType.AMIP1],
      [false, TestType.ADIHPT],
      [false, TestType.ADIP1],
      [false, TestType.CAR],
      [false, TestType.ERS],
      [false, TestType.LGVCPC],
      [false, TestType.LGVCPCC],
      [false, TestType.LGVHPT],
      [false, TestType.LGVMC],
      [false, TestType.MOTORCYCLE],
      [false, TestType.PCVCPC],
      [false, TestType.PCVCPCC],
      [false, TestType.PCVHPT],
      [false, TestType.PCVMC],
      [false, TestType.TAXI],
      [false, undefined],
      [false, null],
    ])('returns %s if the given test type is %s', (expectedResult: boolean, givenTestType: TestType) => {
      const actualResult = isZeroCostTest(givenTestType);

      expect(actualResult).toEqual(expectedResult);
    });
  });
});
