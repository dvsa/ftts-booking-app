import { TheoryTests } from '../../../../src/pages/details/theory-tests';
import { TheoryTest } from '../../../../src/pages/details/theory-test';

describe('TheoryTests', () => {
  let carTheoryTest: TheoryTest;
  let bikeTheoryTest: TheoryTest;
  let theoryTests: TheoryTests;

  beforeEach(() => {
    carTheoryTest = TheoryTest.of('Car');
    bikeTheoryTest = TheoryTest.of('Motorcycle');
    theoryTests = new TheoryTests([carTheoryTest, bikeTheoryTest]);
  });

  describe('get', () => {
    test('should return the list of tests', () => {
      expect(theoryTests.get()).toEqual([carTheoryTest, bikeTheoryTest]);
    });
  });

  describe('minus', () => {
    test('should remove a test type if it exists in the list of tests', () => {
      expect(theoryTests.minus(new TheoryTests([bikeTheoryTest]))).toEqual(new TheoryTests([carTheoryTest]));
    });
  });

  describe('contains', () => {
    test('should return true if test provided is in the list of available tests', () => {
      expect(theoryTests.contains(carTheoryTest)).toBe(true);
    });
    test('should return false if test provided is not in the list of available tests', () => {
      expect(new TheoryTests([]).contains(bikeTheoryTest)).toBe(false);
    });
  });
});
