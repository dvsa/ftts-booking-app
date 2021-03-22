/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { enter, click } from '../utils/helpers';
import { TestTypePage } from './test-type-page';

export class ContactDetailsPage extends BasePage {
  // contents
  pageTitle = 'Email address';

  pageHeading = 'Email of the person taking the theory test';

  pageHeadingNSA = 'Enter your email address';

  errorMessageHeader = 'There is a problem';

  invalidEmailErrorText = 'Enter a valid email address';

  confirmEmailMatchesErrorText = 'Ensure confirmation email address matches email address';

  over100CharsErrorText = 'Email address must be 100 characters or fewer';

  updateEmailBannerText = 'You can change the email address associated with this booking or keep the last one saved.';

  updateEmailButtonText = 'Confirm change and continue';

  cancelEmailButtonText = 'Cancel and keep existing email';

  cancelEmailLinkText = 'keep the last one saved';

  // locators
  pageTitleLocator = '.govuk-fieldset__heading';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = '#cancel';

  emailAddressTextBox = 'input[data-automation-id="email"]';

  confirmEmailAddressTextBox = 'input[data-automation-id="confirmEmail"]';

  backLink = '.govuk-back-link';

  emailAddressErrorLink = 'a[href="#email"]';

  confirmEmailAddressErrorLink = 'a[href="#confirmEmail"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  updateEmailBanner = 'div.alert';

  pathUrl = 'contact-details';

  async enterContactDetails(emailAddress: string, confirmEmailAddress: string): Promise<TestTypePage> {
    await enter(this.emailAddressTextBox, emailAddress);
    await enter(this.confirmEmailAddressTextBox, confirmEmailAddress);
    await click(this.continueButton);
    return new TestTypePage();
  }

  async clickEmailErrorLink(): Promise<void> {
    await click(this.emailAddressErrorLink);
  }

  async clickConfirmEmailErrorLink(): Promise<void> {
    await click(this.confirmEmailAddressErrorLink);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
