import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { Candidate } from '../../../../src/services/session';
import { addressBuilder } from './address-builder';
import { eligibilityBuilder } from './eligibility-builder';
import { TestType } from '../../../../src/domain/enums';
import { CRMEvidenceStatus } from '../../../../src/services/crm-gateway/enums';
import { eligibleTestTypes, genderTypes } from './types';

export const candidateBuilder = (eligible = true, behaviouralMarker = false, eligibleFrom?: string, eligibleTo?: string,
  reasonForIneligibility?: string, supportNeedName?: string,
  supportEvidenceStatus?: CRMEvidenceStatus,
  behaviouralMarkerExpiryDate?: string, line5?: string): Candidate => {
  const overrides = {
    eligibleToBookOnline: eligible,
    behaviouralMarker,
    behaviouralMarkerExpiryDate,
    supportEvidenceStatus,
    supportNeedName,
  };

  return build<Candidate>({
    fields: {
      title: faker.name.prefix(),
      firstnames: faker.name.firstName(),
      surname: faker.name.lastName(),
      gender: faker.helpers.arrayElement(genderTypes),
      dateOfBirth: faker.date.birthdate().toISOString().split('T')[0],
      eligibilities: eligibleTestTypes.map((testType: TestType) => eligibilityBuilder(testType, eligible, eligibleFrom, eligibleTo, reasonForIneligibility)),
      licenceNumber: faker.random.alphaNumeric(16), // DVSA Licence
      licenceId: faker.datatype.uuid(),
      email: faker.internet.email(),
      telephone: faker.phone.number('+44 7## #### ###'),
      candidateId: faker.datatype.uuid(),
      address: addressBuilder(line5),
      personReference: faker.datatype.uuid(),
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      behaviouralMarkerExpiryDate: undefined, // YYYY-MM-DD
      personalReferenceNumber: faker.random.numeric(10),
      paymentReceiptNumber: faker.random.numeric(10),
      ownerId: faker.datatype.uuid(),
      supportNeedName: undefined,
      supportEvidenceStatus: undefined,
    },
  })({
    overrides,
  });
};
