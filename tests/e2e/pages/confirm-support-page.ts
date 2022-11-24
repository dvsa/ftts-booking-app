/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class ConfirmSupportPage extends BasePage {
  // locators
  pageHeadingLocator = 'h1.govuk-heading-xl';

  tellUsWhatSupportRadio = 'input[data-automation-id="tell-us-what-support"]';

  bookWithoutSupportRadio = 'input[data-automation-id="book-without-support"]';

  continueWithoutTellingUsRadio = 'input[data-automation-id="continue-without-telling-us"]';

  continueButton = 'button[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back"]';

  errorLink = 'a[href="#confirmSupport"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorMessageTextAreaLocator = '#support-error';

  pathUrl = 'nsa/confirm-support';

  // content
  pageHeading = 'You did not tell us what type of support you need';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'Select one option from the list';

  updateButtonText = 'Continue';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async continueNsaWithoutTellingUsWhatSupport(): Promise<void> {
    await click(this.continueWithoutTellingUsRadio);
    await click(this.continueButton);
  }

  async continueBookingWithoutSupport(): Promise<void> {
    await click(this.bookWithoutSupportRadio);
    await click(this.continueButton);
  }

  async tellUsWhatSupportRequired(): Promise<void> {
    await click(this.tellUsWhatSupportRadio);
    await click(this.continueButton);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
