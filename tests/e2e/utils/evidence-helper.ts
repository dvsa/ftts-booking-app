import { SupportType } from '../../../src/domain/enums';
import { EvidencePathNames } from '../data/constants';

export const isDeafCandidate = (supportTypes: SupportType[]): boolean => supportTypes.includes(SupportType.ON_SCREEN_BSL) || supportTypes.includes(SupportType.BSL_INTERPRETER);

const isEvidenceRequired = (supportTypes: SupportType[]) : boolean => {
  if (!supportTypes.includes(SupportType.EXTRA_TIME) && !supportTypes.includes(SupportType.READING_SUPPORT)) {
    return false;
  }

  // Exception for deaf candidates
  if (isDeafCandidate(supportTypes)
      && supportTypes.includes(SupportType.EXTRA_TIME)
      && !supportTypes.includes(SupportType.READING_SUPPORT)) {
    return false;
  }

  return true;
};

export const determineEvidenceRoute = (supportTypes: SupportType[], hasSupportNeedsInCRM: boolean): EvidencePathNames => {
  if (hasSupportNeedsInCRM) {
    return EvidencePathNames.RETURNING_CANDIDATE;
  }
  if (isEvidenceRequired(supportTypes)) return EvidencePathNames.EVIDENCE_REQUIRED;

  if (supportTypes.includes(SupportType.OTHER)) return EvidencePathNames.EVIDENCE_MAY_BE_REQUIRED;

  return EvidencePathNames.EVIDENCE_NOT_REQUIRED;
};
