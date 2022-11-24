import { PageNames } from '@constants';
import { SupportType } from '../domain/enums';

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

export const determineEvidenceRoute = (supportTypes: SupportType[], hasSupportNeedsInCRM: boolean): PageNames => {
  if (hasSupportNeedsInCRM) {
    return PageNames.RETURNING_CANDIDATE;
  }
  if (isEvidenceRequired(supportTypes)) return PageNames.EVIDENCE_REQUIRED;

  if (supportTypes.includes(SupportType.OTHER)) return PageNames.EVIDENCE_MAY_BE_REQUIRED;

  return PageNames.EVIDENCE_NOT_REQUIRED;
};
