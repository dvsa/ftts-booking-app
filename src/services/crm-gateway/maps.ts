import { Origin, TestType } from '../../domain/enums';
import {
  CRMTestType, TestEngineTestType, CRMProductNumber, CRMOrigin,
} from './enums';

const invertMap = <Key, Value>(map: Map<Key, Value>): Map<Value, Key> => new Map(Array.from(map, (e) => [e[1], e[0]]));

export const toCRMTestType = (testType: TestType): CRMTestType => TEST_TYPE_TO_CRM_TEST_TYPE.get(testType) as CRMTestType;

export const fromCRMTestType = (crmTestType: CRMTestType): TestType => CRM_TEST_TYPE_TO_TEST_TYPE.get(crmTestType) as TestType;

export const toTestEngineTestType = (testType: TestType): TestEngineTestType => {
  const crmTestType = toCRMTestType(testType);
  return CRM_TEST_TYPE_TO_TEST_ENGINE_TEST_TYPE.get(crmTestType) as TestEngineTestType;
};

export const toCRMProductNumber = (testType: TestType): CRMProductNumber => TEST_TYPE_TO_CRM_PRODUCT_NUMBER.get(testType) as CRMProductNumber;

export const fromCRMProductNumber = (crmProductNumber: CRMProductNumber): TestType => CRM_PRODUCT_NUMBER_TO_TEST_TYPE.get(crmProductNumber) as TestType;

export const fromCRMOrigin = (crmOrigin: CRMOrigin): Origin => CRM_ORIGIN_TO_ORIGIN.get(crmOrigin) as Origin;

const TEST_TYPE_TO_CRM_TEST_TYPE: Map<TestType, CRMTestType> = new Map([
  [TestType.CAR, CRMTestType.Car],
  [TestType.MOTORCYCLE, CRMTestType.Motorcycle],
]);

const CRM_TEST_TYPE_TO_TEST_TYPE = invertMap(TEST_TYPE_TO_CRM_TEST_TYPE);

const CRM_TEST_TYPE_TO_TEST_ENGINE_TEST_TYPE: Map<CRMTestType, TestEngineTestType> = new Map([
  [CRMTestType.Car, TestEngineTestType.Car],
  [CRMTestType.Motorcycle, TestEngineTestType.Motorcycle],
]);

const CRM_ORIGIN_TO_ORIGIN: Map<CRMOrigin, Origin> = new Map([
  [CRMOrigin.CitizenPortal, Origin.CitizenPortal],
  [CRMOrigin.CustomerServiceCentre, Origin.CustomerServiceCentre],
  [CRMOrigin.IHTTCPortal, Origin.IHTTCPortal],
  [CRMOrigin.TrainerBookerPortal, Origin.TrainerBookerPortal],
]);

const TEST_TYPE_TO_CRM_PRODUCT_NUMBER: Map<TestType, CRMProductNumber> = new Map([
  [TestType.CAR, CRMProductNumber.CAR],
  [TestType.MOTORCYCLE, CRMProductNumber.MOTORCYCLE],
  [TestType.LGVMC, CRMProductNumber.LGVMC],
  [TestType.LGVHPT, CRMProductNumber.LGVHPT],
  [TestType.LGVCPC, CRMProductNumber.LGVCPC],
  [TestType.LGVCPCC, CRMProductNumber.LGVCPCC],
  [TestType.PCVMC, CRMProductNumber.PCVMC],
  [TestType.PCVHPT, CRMProductNumber.PCVHPT],
  [TestType.PCVCPC, CRMProductNumber.PCVCPC],
  [TestType.PCVCPCC, CRMProductNumber.PCVCPCC],
  [TestType.ADIP1, CRMProductNumber.ADIP1],
  [TestType.ADIHPT, CRMProductNumber.ADIHPT],
  [TestType.ERS, CRMProductNumber.ERS],
  [TestType.AMIP1, CRMProductNumber.AMIP1],
  [TestType.TAXI, CRMProductNumber.TAXI],
  [TestType.ADIP1DVA, CRMProductNumber.ADIP1DVA],
]);

const CRM_PRODUCT_NUMBER_TO_TEST_TYPE = invertMap(TEST_TYPE_TO_CRM_PRODUCT_NUMBER);
