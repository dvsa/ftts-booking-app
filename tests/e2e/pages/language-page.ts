/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, clickWithText } from '../utils/helpers';

export class LanguagePage extends BasePage {
  pageHeadingLocator = '.govuk-fieldset__heading';

  testLanguageRadio = '#testLanguage';

  languageHintLocator = '#changed-name-hint';

  errorLink = `a[href="${this.testLanguageRadio}"]`;

  errorMessageRadioLocator = '#testLanguage-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  testLanguageButtonEnglish = 'input[data-automation-id=english]';

  testLanguageButtonWelsh = 'input[data-automation-id=welsh]';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = '.govuk-back-link';

  pathUrl = 'test-language';

  updateLanguageBanner = 'div.alert';

  // Contents
  pageHeading = 'Which language do you want to appear on screen during the theory test?';

  languageHintText = 'Choose a language';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select a language';

  updateLanguageBannerText = 'You can change the test language or keep your existing choice.';

  updateLanguageButtonText = 'Confirm change and continue';

  cancelLanguageButtonText = 'Cancel and keep existing language';

  cancelLanguageLinkText = 'keep your existing choice';

  async selectTestLanguage(language: string): Promise<void> {
    await clickWithText('label', language);
    await click(this.continueButton);
  }

  async editTestLanguage(language: string): Promise<void> {
    await clickWithText('label', language);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
