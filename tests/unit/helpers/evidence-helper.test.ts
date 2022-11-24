import { PageNames } from '@constants';
import {
  SupportType,
} from '../../../src/domain/enums';
import { determineEvidenceRoute, isDeafCandidate } from '../../../src/helpers/evidence-helper';

const evidenceMatch: Array<[SupportType[], Views]> = [
  // 1 option
  [[SupportType.ON_SCREEN_BSL], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.BSL_INTERPRETER], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.VOICEOVER], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.EXTRA_TIME], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  // 2 options
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.BSL_INTERPRETER], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME], PageNames.EVIDENCE_NOT_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME], PageNames.EVIDENCE_NOT_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.EXTRA_TIME], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.EXTRA_TIME, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.EXTRA_TIME, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.EXTRA_TIME, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  // 3 options
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME], PageNames.EVIDENCE_NOT_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME], PageNames.EVIDENCE_NOT_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.VOICEOVER, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  // 4 options
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.TRANSLATOR], PageNames.EVIDENCE_NOT_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.VOICEOVER, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  // 5 options
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED],
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_MAY_BE_REQUIRED], // Deaf candidate with extra time
  // 6 options
  [[SupportType.BSL_INTERPRETER, SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
  [[SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER, SupportType.TRANSLATOR], PageNames.EVIDENCE_REQUIRED], // Deaf candidate with extra time
];

describe('evidence-helper', () => {
  describe('isDeafCandidate', () => {
    test.each([
      [[SupportType.BSL_INTERPRETER], true],
      [[SupportType.ON_SCREEN_BSL], true],
      [[SupportType.BSL_INTERPRETER, SupportType.ON_SCREEN_BSL], true],
      [[SupportType.EXTRA_TIME], false],
    ])('for given support types: %s returns "%s"', (supportTypesEntry: SupportType[], expectedResult: boolean) => {
      expect(isDeafCandidate(supportTypesEntry)).toBe(expectedResult);
    });
  });

  describe('determineEvidenceRoute', () => {
    test.each(evidenceMatch)('for given support types: %s and has hasSupportNeedsInCRM is "false", returns "%s"', (supportTypesEntry: SupportType[], expectedPath: string) => {
      expect(determineEvidenceRoute(supportTypesEntry, false)).toEqual(expectedPath);
    });

    test.each(evidenceMatch)('for given support types: %s and has hasSupportNeedsInCRM is "true", returns "returning-candidate"', (supportTypesEntry: SupportType[]) => {
      expect(determineEvidenceRoute(supportTypesEntry, true)).toEqual(PageNames.RETURNING_CANDIDATE);
    });
  });
});
