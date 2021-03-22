import { TARGET, Voiceover } from './enums';
import { CRMVoiceOver } from '../services/crm-gateway/enums';

export class TestVoiceover {
  public static fromCRMVoiceover(crmVoiceOver: CRMVoiceOver): Voiceover {
    return this.CRM_VOICEOVER_MAP.get(crmVoiceOver) || Voiceover.NONE;
  }

  public static fromDVSAVoiceoverOption(value: Voiceover): string {
    return this.DVSA_VOICEOVER_OPTIONS.get(value) || this.DVSA_VOICEOVER_OPTIONS.get(Voiceover.NONE) || Voiceover.NONE;
  }

  public static fromDVAVoiceoverOption(value: Voiceover): string {
    return this.DVA_VOICEOVER_OPTIONS.get(value) || this.DVA_VOICEOVER_OPTIONS.get(Voiceover.NONE) || Voiceover.NONE;
  }

  public static availableOptions(target: TARGET): Map<Voiceover, string> {
    if (target === TARGET.NI) {
      return this.DVA_VOICEOVER_OPTIONS;
    }
    return this.DVSA_VOICEOVER_OPTIONS;
  }

  private static readonly DVSA_VOICEOVER_OPTIONS: Map<Voiceover, string> = new Map([
    [Voiceover.ENGLISH, 'English'],
    [Voiceover.WELSH, 'Cymraeg (Welsh)'],
    [Voiceover.NONE, 'None'],
  ]);

  private static readonly DVA_VOICEOVER_OPTIONS: Map<Voiceover, string> = new Map([
    [Voiceover.ENGLISH, 'English'],
    [Voiceover.TURKISH, 'Turkish'],
    [Voiceover.PORTUGUESE, 'Portuguese'],
    [Voiceover.POLISH, 'Polish'],
    [Voiceover.FARSI, 'Farsi'],
    [Voiceover.CANTONESE, 'Cantonese'],
    [Voiceover.ARABIC, 'Arabic'],
    [Voiceover.NONE, 'None'],
  ]);

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
