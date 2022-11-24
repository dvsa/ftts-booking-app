/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { enter, click } from '../utils/helpers';
import { TestTypePage } from './test-type-page';

export class ContactDetailsPage extends BasePage {
  // contents
  pageHeading = 'Email of the person taking the theory test';

  pageHeadingNSA = 'Provide an email address';

  errorMessageHeader = 'There is a problem';

  invalidEmailErrorText = 'Enter a valid email address';

  invalidConfirmationEmailErrorText = 'Enter a valid confirmation email address';

  confirmEmailMatchesErrorText = 'Ensure confirmation email address matches email address';

  over100CharsErrorText = 'Email address must be 100 characters or fewer';

  updateEmailBannerText = 'You can change the email address associated with this booking or keep the last one saved.';

  updateEmailButtonText = 'Confirm change and continue';

  cancelEmailButtonText = 'Cancel and keep existing email';

  cancelEmailLinkText = 'keep the last one saved';

  // locators
  pageHeadingLocator = '.govuk-fieldset__heading';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  emailAddressTextBox = 'input[data-automation-id="email"]';

  confirmEmailAddressTextBox = 'input[data-automation-id="confirmEmail"]';

  backLink = '.govuk-back-link';

  emailAddressErrorLink = 'a[href="#email"]';

  confirmEmailAddressErrorLink = 'a[href="#confirmEmail"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  updateEmailBanner = 'div.alert';

  pathUrl = 'email-contact';

  pathUrlNsa = `nsa/${this.pathUrl}`;

  async enterContactDetails(emailAddress: string, confirmEmailAddress: string): Promise<TestTypePage> {
    await enter(this.emailAddressTextBox, emailAddress);
    await enter(this.confirmEmailAddressTextBox, confirmEmailAddress);
    await click(this.continueButton);
    return new TestTypePage();
  }

  async clickContinue(): Promise<TestTypePage> {
    await click(this.continueButton);
    return new TestTypePage();
  }

  async editEmailAddress(emailAddress: string, confirmEmailAddress: string): Promise<void> {
    await enter(this.emailAddressTextBox, emailAddress);
    await enter(this.confirmEmailAddressTextBox, confirmEmailAddress);
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
