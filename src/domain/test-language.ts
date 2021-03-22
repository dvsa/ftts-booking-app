import { translate } from '../helpers/language';
import { LANGUAGE } from './enums';
import { CRMTestLanguage } from '../services/crm-gateway/enums';

export class TestLanguage {
  public static from(testLanguage: string): TestLanguage {
    if (!this.isAvailableLanguage(testLanguage)) {
      throw new Error(translate('testLanguage.validationError'));
    }
    return new TestLanguage(testLanguage);
  }

  public static fromCRMTestLanguage(crmTestLanguage: CRMTestLanguage): TestLanguage {
    const testLanguage = this.CRM_TEST_LANGUAGE_MAP.get(crmTestLanguage) || '';
    return this.from(testLanguage);
  }

  public static isAvailableLanguage(testLanguage: string | undefined): boolean {
    if (testLanguage) {
      return TestLanguage.LANGUAGES.has(testLanguage.toLowerCase());
    }
    return false;
  }

  public static isValid(testLanguage: string): boolean {
    return TestLanguage.from(testLanguage) instanceof TestLanguage;
  }

  public static availableLanguages(): Map<string, string> {
    return new Map<string, string>(TestLanguage.LANGUAGES);
  }

  private static readonly PREFIX: string = 'Language: ';

  private static readonly LANGUAGES: Map<string, string> = new Map([
    [LANGUAGE.ENGLISH, 'English'],
    [LANGUAGE.WELSH, 'Cymraeg (Welsh)'],
  ]);

  private static readonly CRM_TEST_LANGUAGE_MAP: Map<CRMTestLanguage, LANGUAGE> = new Map([
    [CRMTestLanguage.English, LANGUAGE.ENGLISH],
    [CRMTestLanguage.Welsh, LANGUAGE.WELSH],
  ]);

  private readonly testLanguage: string;

  constructor(testLanguage: string) {
    this.testLanguage = testLanguage.toLowerCase();
  }

  public toString(): string {
    if (TestLanguage.isValid(this.testLanguage)) {
      return translate(`generalContent.language.${this.testLanguage}`);
    }
    return '';
  }

  public key(): string {
    return this.testLanguage;
  }

  public toSummaryString(): string {
    return TestLanguage.PREFIX + this.toString();
  }
}
