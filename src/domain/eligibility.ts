import dayjs from 'dayjs';
import { Target, TestType } from './enums';
import { Eligibility } from './types';

const NON_BOOKABLE_TEST_TYPES = [
  TestType.ADIP1,
  TestType.ADIHPT,
  TestType.AMIP1,
  TestType.ERS,
];

const DVA_ONLY_TEST_TYPES = [
  TestType.TAXI,
  TestType.LGVCPCC,
  TestType.PCVCPCC,
];

export const INSTRUCTOR_TEST_TYPES = [
  TestType.ADIP1,
  TestType.ADIHPT,
  TestType.ERS,
  TestType.ADIP1DVA,
  TestType.AMIP1,
];

export const VOICEOVER_UNAVAILABLE_TEST_TYPES = [
  TestType.ADIP1DVA,
  TestType.AMIP1,
];

const ZERO_COST_TEST_TYPES = [
  TestType.ADIP1DVA,
  TestType.AMIP1,
];

/**
 * Returns true if eligibility item is:
 * - eligible
 * - not one of the test types that can't be booked online
 * - if in target GB, not one of the test types that are DVA only
 * - if eligible from date is before today plus 6 months
 * - if eligible to date is after today
 */
export const isBookable = (eligibility: Eligibility, target: Target): boolean => eligibility.eligible
  && !NON_BOOKABLE_TEST_TYPES.includes(eligibility.testType)
  && !(target === Target.GB && DVA_ONLY_TEST_TYPES.includes(eligibility.testType))
  && dayjs(eligibility.eligibleFrom).isBefore(dayjs().add(6, 'months'))
  && dayjs(eligibility.eligibleTo).isAfter(dayjs());

export const isInstructorBookable = (eligibility: Eligibility, target: Target): boolean => eligibility.eligible
  && INSTRUCTOR_TEST_TYPES.includes(eligibility.testType)
  && !(target === Target.GB && DVA_ONLY_TEST_TYPES.includes(eligibility.testType))
  && validateEligibleDates(eligibility);

const validateEligibleDates = (eligibility: Eligibility): boolean => {
  if (eligibility.testType === TestType.ERS) {
    return true;
  }

  return dayjs(eligibility.eligibleFrom).isBefore(dayjs().add(6, 'months'))
    && dayjs(eligibility.eligibleTo).isAfter(dayjs());
};

export const hasBehaviouralMarkerForTest = (testDate: string, behaviouralMarker?: boolean, behaviouralMarkerExpiryDate?: string): boolean => {
  if (!behaviouralMarker) {
    return false;
  }

  return dayjs(testDate).isBefore(dayjs(behaviouralMarkerExpiryDate));
};

export const behaviouralMarkerLabel = 'Candidate has a behavioural marker';

export const isZeroCostTest = (testType: TestType): boolean => ZERO_COST_TEST_TYPES.includes(testType);
