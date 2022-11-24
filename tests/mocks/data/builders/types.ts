import { CandidateDetails } from '@dvsa/ftts-eligibility-api-model/dist/generated/candidateDetails';
import { Origin, SupportType, TestType } from '../../../../src/domain/enums';
import { CRMTestSupportNeed } from '../../../../src/services/crm-gateway/enums';

export const eligibleTestTypes = Object.values(TestType);
export const supportTypes = Object.values(SupportType);
export const originTypes = Object.values(Origin);
export const crmTestSupportNeed = Object.values(CRMTestSupportNeed) as CRMTestSupportNeed[];
export const genderTypes = Object.values(CandidateDetails.GenderEnum) as CandidateDetails.GenderEnum[];
