/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class NsaTelephoneContactPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-fieldset__heading';

  yesButton = 'input[data-automation-id="yes"]';

  noButton = 'input[data-automation-id="no"]';

  continueButton = 'button[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'telephone-contact';

  errorLink = 'a[href="contactByTelephone"]';

  errorMessageRadioLocator = 'span[data-automation-id="contactByTelephone-error"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  // content
  pageTitle = 'Telephone Contact';

  pageHeading = 'Would you prefer to be contacted by telephone?';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  errorEnterTelephone = 'Enter a telephone number';

  error50Chars = 'The telephone number must be 50 characters or fewer';

  continueButtonText = 'Continue';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
