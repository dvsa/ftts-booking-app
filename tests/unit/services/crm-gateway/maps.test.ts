import { TestType } from '../../../../src/domain/enums';
import { CRMProductNumber } from '../../../../src/services/crm-gateway/enums';
import { fromCRMProductNumber, toCRMProductNumber } from '../../../../src/services/crm-gateway/maps';

describe('CRM maps', () => {
  describe('TestType helpers', () => {
    describe('toCRMProductNumber - maps one-to-one TestType to CRMProductNumber', () => {
      test.each(Object.values(TestType))('%s', (testType) => {
        const result = toCRMProductNumber(testType);

        expect(result).toBeDefined();
        expect(Object.values(CRMProductNumber)).toContain(result);
      });
    });

    describe('fromCRMProductNumber - maps one-to-one CRMProductNumber to TestType', () => {
      test.each(Object.values(CRMProductNumber))('%s', (crmProductNumber) => {
        const result = fromCRMProductNumber(crmProductNumber);

        expect(result).toBeDefined();
        expect(Object.values(TestType)).toContain(result);
      });
    });
  });
});
