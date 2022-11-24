import { bslIsAvailable } from '../../../src/domain/bsl';
import {
  SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { SupportTypeOption } from '../../../src/domain/types';
import {
  canChangeBsl, canChangeVoiceover, canShowBslChangeButton, canShowVoiceoverChangeButton,
  isNonStandardSupportSelected, isOnlyStandardSupportSelected, isOnlyCustomSupportSelected, removeInvalidOptions, toSupportTypeOptions, getInvalidOptions,
} from '../../../src/helpers/support';

jest.mock('../../../src/domain/bsl', () => ({
  bslIsAvailable: jest.fn(),
}));

const invalidOptionMatches: Array<[Target, TestType, SupportType[]]> = [
  [Target.GB, TestType.LGVHPT, [SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.BSL_INTERPRETER, SupportType.ON_SCREEN_BSL]],
  [Target.GB, TestType.PCVHPT, [SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.BSL_INTERPRETER, SupportType.ON_SCREEN_BSL]],
  [Target.GB, TestType.ADIHPT, [SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.BSL_INTERPRETER, SupportType.ON_SCREEN_BSL]],
  [Target.NI, TestType.LGVHPT, [SupportType.EXTRA_TIME, SupportType.BSL_INTERPRETER, SupportType.ON_SCREEN_BSL]],
  [Target.NI, TestType.PCVHPT, [SupportType.EXTRA_TIME, SupportType.BSL_INTERPRETER, SupportType.ON_SCREEN_BSL]],
];

describe('Support Helper', () => {
  describe('canChangeBsl', () => {
    test('can change bsl if voiceover is not selected', () => {
      expect(canChangeBsl(Voiceover.NONE)).toBe(true);
      expect(canChangeBsl(undefined)).toBe(true);
    });

    test('cannot change bsl if voiceover is selected', () => {
      expect(canChangeBsl(Voiceover.ENGLISH)).toBe(false);
    });
  });

  describe('canChangeVoiceover', () => {
    test('can change voiceover if bsl is not selected', () => {
      expect(canChangeVoiceover(false)).toBe(true);
      expect(canChangeVoiceover(undefined)).toBe(true);
    });

    test('cannot change voiceover if bsl is selected', () => {
      expect(canChangeVoiceover(true)).toBe(false);
    });
  });

  describe('canShowBslChangeButton', () => {
    test('shows bsl change button if voiceover is not selected', () => {
      expect(canShowBslChangeButton(true, Voiceover.NONE)).toBe(true);
      expect(canShowBslChangeButton(true)).toBe(true);
      expect(canShowBslChangeButton(false, Voiceover.NONE)).toBe(true);
      expect(canShowBslChangeButton(false, undefined)).toBe(true);
    });

    test('does not show bsl change button if voiceover is selected', () => {
      expect(canShowBslChangeButton(false, Voiceover.ENGLISH)).toBe(false);
    });

    test('shows bsl change button if both bsl & voiceover is selected', () => {
      expect(canShowBslChangeButton(true, Voiceover.ENGLISH)).toBe(true);
    });
  });

  describe('canShowVoiceoverChangeButton', () => {
    test('shows voiceover change button if bsl is not selected', () => {
      expect(canShowVoiceoverChangeButton(Voiceover.NONE, false)).toBe(true);
    });

    test('does not show voiceover change button if bsl is selected', () => {
      expect(canShowVoiceoverChangeButton(Voiceover.NONE, true)).toBe(false);
    });

    test('shows bsl change button if both bsl & voiceover is selected', () => {
      expect(canShowVoiceoverChangeButton(Voiceover.ENGLISH, false)).toBe(true);
    });
  });

  describe('isNonStandardSupportSelected', () => {
    test('returns true if includes one of the non standard support types', () => {
      const supportTypes: SupportType[] = [SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME];
      expect(isNonStandardSupportSelected(supportTypes)).toBe(true);
    });

    test('returns false if does not include one of the non standard support types', () => {
      const supportTypes: SupportType[] = [SupportType.ON_SCREEN_BSL, SupportType.VOICEOVER];
      expect(isNonStandardSupportSelected(supportTypes)).toBe(false);
    });
  });

  describe('isOnlyStandardSupportSelected', () => {
    test('returns true if only standard support types', () => {
      const supportTypes: SupportType[] = [SupportType.ON_SCREEN_BSL, SupportType.VOICEOVER];
      expect(isOnlyStandardSupportSelected(supportTypes)).toBe(true);
    });

    test('returns false if not only standard support types', () => {
      const supportTypes: SupportType[] = [SupportType.READING_SUPPORT, SupportType.VOICEOVER];
      expect(isOnlyStandardSupportSelected(supportTypes)).toBe(false);
    });
  });

  describe('isOnlyCustomSupportSelected', () => {
    test('returns true if only custom/other support', () => {
      const supportTypes: SupportType[] = [SupportType.OTHER];
      expect(isOnlyCustomSupportSelected(supportTypes)).toBe(true);
    });

    test('returns false if not only custom support', () => {
      const supportTypes: SupportType[] = [SupportType.EXTRA_TIME, SupportType.OTHER];
      expect(isOnlyCustomSupportSelected(supportTypes)).toBe(false);
    });
  });

  describe('removeInvalidOptionsFrom', () => {
    let supportTypeOptions: Map<string, SupportTypeOption>;
    beforeEach(() => {
      supportTypeOptions = toSupportTypeOptions([
        SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.VOICEOVER,
        SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER,
      ]);
    });

    test.each(invalidOptionMatches)('for target: %s and selected test type is: %s removes the following options from the list: %s', (target: Target, testType: TestType, selectSupportType: SupportType[]) => {
      const req: any = {
        session: {
          target,
          currentBooking: {
            testType,
          },
        },
      };
      removeInvalidOptions(supportTypeOptions, req);

      selectSupportType.forEach((supportType) => {
        expect(supportTypeOptions.keys()).not.toContain(supportType);
      });
    });

    test.each([
      Target.GB,
      Target.NI,
    ])('when On-screen BSL not available, removes On-screen BSL support option from the list', (target: Target) => {
      bslIsAvailable.mockReturnValue(false);
      const req: any = {
        session: {
          target,
          currentBooking: {
            testType: TestType.ADIHPT,
          },
        },
      };
      removeInvalidOptions(supportTypeOptions, req);

      expect(supportTypeOptions.keys()).not.toContain(SupportType.ON_SCREEN_BSL);
    });
  });

  describe('getInvalidOptions', () => {
    test.each(invalidOptionMatches)('for target: %s and selected test type is: %s returns: %s', (target: Target, testType: TestType, expectedSupportTypesList: SupportType[]) => {
      expect(getInvalidOptions(testType, target)).toEqual(expectedSupportTypesList);
    });
  });
});
