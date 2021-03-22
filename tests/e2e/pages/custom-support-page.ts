/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';
import { SessionData } from '../data/session-data';

export class CustomSupportPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-heading-xl';

  supportTextArea = 'textarea[data-automation-id="input"]';

  continueButton = 'button[data-automation-id="continue"]';

  backLink = 'a[data-automation-id="back"]';

  charCountHintText = '#support-info';

  errorLink = 'a[href="#support"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorMessageTextAreaLocator = '#support-error';

  pathUrl = 'custom-support';

  // content
  pageTitle = 'Custom Support';

  pageHeading = 'Tell us what support you need';

  characterCountText = 'You have 4000 characters remaining';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'The text you enter here must be 4000 characters or fewer';

  async enterSupportInformation(sessionData: SessionData, supportText: string): Promise<void> {
    sessionData.currentBooking.customSupport = supportText;
    await enter(this.supportTextArea, supportText);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
