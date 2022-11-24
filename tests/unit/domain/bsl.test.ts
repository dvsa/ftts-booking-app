import { bslIsAvailable } from '../../../src/domain/bsl';
import { TestType } from '../../../src/domain/enums';

describe('BSL domain logic', () => {
  describe('bslIsAvailable - checks if British Sign Language option is available for the given test type', () => {
    test('returns true for car test type', () => {
      expect(bslIsAvailable(TestType.CAR)).toBe(true);
    });

    test('returns true for motorcycle test type', () => {
      expect(bslIsAvailable(TestType.MOTORCYCLE)).toBe(true);
    });

    test.each([
      TestType.LGVMC,
      TestType.LGVHPT,
      TestType.LGVCPC,
      TestType.LGVCPCC,
      TestType.PCVMC,
      TestType.PCVHPT,
      TestType.PCVCPC,
      TestType.PCVCPCC,
      TestType.TAXI,
    ])('returns false for %s test type', (testType: TestType) => {
      expect(bslIsAvailable(testType)).toBe(false);
    });

    test.each([
      TestType.ADIP1,
      TestType.ADIHPT,
      TestType.ERS,
      TestType.ADIP1DVA,
      TestType.AMIP1,
    ])('returns false for instructor %s test type', (testType: TestType) => {
      expect(bslIsAvailable(testType)).toBe(false);
    });
  });
});
