/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';
import { SessionData } from '../data/session-data';

export class TranslatorPage extends BasePage {
  // locators
  pageHeadingLocator = 'label[data-automation-id="heading"]';

  continueButton = 'button[data-automation-id="submit"]';

  translatorTextArea = 'textarea[data-automation-id="translator"]';

  errorLink = 'a[href="#translator"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorMessageTextAreaLocator = '#translator-error';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'translator';

  // content
  pageTitle = ''; // to be added later

  pageHeading = 'Which language do you want translated?';

  errorMessageHeader = 'There is a problem';

  emptyErrorMessageText = 'Enter the language you need translated';

  overLimitErrorMessageText = 'The translation language description must be 100 characters or fewer';

  async enterSupportInformation(sessionData: SessionData, translatorText: string): Promise<void> {
    sessionData.currentBooking.translator = translatorText;
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
