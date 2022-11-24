import { Target, TestType, Voiceover } from './enums';
import { CRMVoiceOver } from '../services/crm-gateway/enums';
import { VOICEOVER_UNAVAILABLE_TEST_TYPES } from './eligibility';

export class TestVoiceover {
  public static fromCRMVoiceover(crmVoiceOver: CRMVoiceOver): Voiceover {
    return this.CRM_VOICEOVER_MAP.get(crmVoiceOver) || Voiceover.NONE;
  }

  public static availableOptions(target: Target, testType: TestType): Voiceover[] {
    if (testType === TestType.ERS) {
      return [Voiceover.ENGLISH];
    }
    if (target === Target.NI) {
      switch (testType) {
        case TestType.CAR:
        case TestType.MOTORCYCLE:
          return this.ALL_DVA_VOICEOVER_OPTIONS;
        case TestType.ADIP1DVA:
        case TestType.AMIP1:
          return [];
        default:
          return [Voiceover.ENGLISH];
      }
    }
    return this.ALL_DVSA_VOICEOVER_OPTIONS;
  }

  public static isAvailable(testType: TestType): boolean {
    return !VOICEOVER_UNAVAILABLE_TEST_TYPES.includes(testType);
  }

  private static readonly ALL_DVA_VOICEOVER_OPTIONS = [
    Voiceover.ENGLISH,
    Voiceover.TURKISH,
    Voiceover.PORTUGUESE,
    Voiceover.POLISH,
    Voiceover.FARSI,
    Voiceover.CANTONESE,
    Voiceover.ARABIC,
  ];

  private static readonly ALL_DVSA_VOICEOVER_OPTIONS = [
    Voiceover.ENGLISH,
    Voiceover.WELSH,
  ];

  private static readonly CRM_VOICEOVER_MAP: Map<CRMVoiceOver, Voiceover> = new Map([
    [CRMVoiceOver.Arabic, Voiceover.ARABIC],
    [CRMVoiceOver.Cantonese, Voiceover.CANTONESE],
    [CRMVoiceOver.English, Voiceover.ENGLISH],
    [CRMVoiceOver.Farsi, Voiceover.FARSI],
    [CRMVoiceOver.Polish, Voiceover.POLISH],
    [CRMVoiceOver.Portuguese, Voiceover.PORTUGUESE],
    [CRMVoiceOver.Turkish, Voiceover.TURKISH],
    [CRMVoiceOver.Welsh, Voiceover.WELSH],
    [CRMVoiceOver.None, Voiceover.NONE],
  ]);
}
