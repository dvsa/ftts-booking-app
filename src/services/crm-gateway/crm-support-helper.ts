import { PreferredDay, PreferredLocation, SupportType } from '../../domain/enums';
import { CRMPreferredCommunicationMethod } from './enums';

export class CRMSupportHelper {
  private supportTypes: SupportType[];

  private customSupport: string;

  public static supportTypeMap: Map<SupportType, string> = new Map([
    [SupportType.BSL_INTERPRETER, 'Sign language (interpreter)'],
    [SupportType.EXTRA_TIME, 'Extra time'],
    [SupportType.ON_SCREEN_BSL, 'Sign language (on-screen)'],
    [SupportType.OTHER, 'Other'],
    [SupportType.READING_SUPPORT, 'Reading support with answer entry'],
    [SupportType.TRANSLATOR, 'Translator'],
    [SupportType.VOICEOVER, 'Voiceover'],
  ]);

  public static preferredCommunicationMethod(telephone: string | false | undefined): CRMPreferredCommunicationMethod {
    return telephone ? CRMPreferredCommunicationMethod.Phone : CRMPreferredCommunicationMethod.Email;
  }

  public static getPreferredDayOrLocation(preferredOption: PreferredDay | PreferredLocation | undefined, preferredText: string): string | undefined {
    return (preferredOption === PreferredDay.ParticularDay || preferredOption === PreferredLocation.ParticularLocation) && preferredText ? preferredText : undefined;
  }

  public static getTranslator(supportTypes: SupportType[], translator: string): string | undefined {
    return supportTypes.includes(SupportType.TRANSLATOR) ? translator : undefined;
  }

  public static isVoicemail(telephone: string | false | undefined, voicemail: boolean): boolean | undefined {
    if (telephone) {
      return voicemail;
    }

    return undefined;
  }

  constructor(supportTypes: SupportType[], customSupport: string) {
    this.supportTypes = supportTypes;
    this.customSupport = customSupport;
  }

  public toString(translatorLanguage?: string): string {
    if (!this.supportTypes.includes(SupportType.OTHER)) {
      this.customSupport = '';
    }

    return this.supportTypes && this.supportTypes.length !== 0 ? `${this.deconstructArray(translatorLanguage)}\n\n${this.customSupport || ''}` : '';
  }

  private deconstructArray(translatorLanguage?: string): string {
    return this.supportTypes.map((supportType) => {
      let label = CRMSupportHelper.supportTypeMap.get(supportType);

      if (supportType === SupportType.TRANSLATOR) {
        label = `${label} (${translatorLanguage})`;
      }

      return `- ${label}`;
    }).join('\n');
  }
}
