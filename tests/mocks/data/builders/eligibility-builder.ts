import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { Eligibility } from '../../../../src/domain/types';
import { TestType } from '../../../../src/domain/enums';

export const eligibilityBuilder = (testType: TestType, eligible = true, eligibleFrom?: string, eligibleTo?: string, reasonForIneligibility?: string): Eligibility => {
  const overrides = {
    eligible,
    testType,
    eligibleFrom,
    eligibleTo,
    reasonForIneligibility,
  };

  return build<Eligibility>({
    fields: {
      eligible: true,
      testType: TestType.CAR,
      eligibleFrom: undefined,
      eligibleTo: undefined,
      reasonForIneligibility: undefined,
      personalReferenceNumber: faker.random.numeric(10),
      paymentReceiptNumber: faker.random.numeric(10),
    },
  })({
    overrides,
  });
};
