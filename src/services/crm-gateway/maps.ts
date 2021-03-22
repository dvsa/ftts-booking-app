import { TestType } from '../../domain/enums';
import { CRMTestType, TestEngineTestType } from './enums';

const invertMap = <k, v>(map: Map<k, v>): Map<v, k> => new Map(Array.from(map, (e) => [e[1], e[0]]));

export const toCRMTestType = (testType: TestType): CRMTestType => TEST_TYPE_TO_CRM_TEST_TYPE.get(testType) as CRMTestType;

export const fromCRMTestType = (crmTestType: CRMTestType): TestType => CRM_TEST_TYPE_TO_TEST_TYPE.get(crmTestType) as TestType;

export const toTestEngineTestType = (testType: TestType): TestEngineTestType => {
  const crmTestType = toCRMTestType(testType);
  return CRM_TEST_TYPE_TO_TEST_ENGINE_TEST_TYPE.get(crmTestType) as TestEngineTestType;
};

const TEST_TYPE_TO_CRM_TEST_TYPE: Map<TestType, CRMTestType> = new Map([
  [TestType.Car, CRMTestType.Car],
  [TestType.Motorcycle, CRMTestType.Motorcycle],
]);
const CRM_TEST_TYPE_TO_TEST_TYPE = invertMap(TEST_TYPE_TO_CRM_TEST_TYPE);

const CRM_TEST_TYPE_TO_TEST_ENGINE_TEST_TYPE: Map<CRMTestType, TestEngineTestType> = new Map([
  [CRMTestType.Car, TestEngineTestType.Car],
  [CRMTestType.Motorcycle, TestEngineTestType.Motorcycle],
]);
