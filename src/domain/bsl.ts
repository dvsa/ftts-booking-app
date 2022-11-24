import { INSTRUCTOR_TEST_TYPES } from './eligibility';
import { TestType } from './enums';

export const bslIsAvailable = (testType: TestType | undefined): boolean => !INSTRUCTOR_TEST_TYPES.includes(testType as TestType) && (testType === TestType.CAR || testType === TestType.MOTORCYCLE);
