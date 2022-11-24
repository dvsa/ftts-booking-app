/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';

export class TranslatorPage extends BasePage {
  // locators
  pageHeadingLocator = 'label[data-automation-id="heading"]';

  updateBanner = 'div.alert';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  translatorTextArea = 'textarea[data-automation-id="translator"]';

  errorLink = 'a[href="#translator"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorMessageTextAreaLocator = '#translator-error';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'nsa/translator';

  // content
  pageHeading = 'Which language do you want translated?';

  errorMessageHeader = 'There is a problem';

  emptyErrorMessageText = 'Enter the language you need translated';

  overLimitErrorMessageText = 'The translation language description must be 100 characters or fewer';

  updateBannerText = 'You can change your mind about which language you want translated during your test. Or you can keep your existing choice.';

  updateButtonText = 'Confirm change and continue';

  cancelButtonText = 'Cancel and keep your existing choice';

  cancelLinkText = 'keep your existing choice';

  async enterTranslatorDetails(translatorText: string): Promise<void> {
    await enter(this.translatorTextArea, translatorText);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
