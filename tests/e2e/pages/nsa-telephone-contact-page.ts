/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter, link } from '../utils/helpers';
import { NsaVoicemailPage } from './nsa-voicemail-page';

export class NsaTelephoneContactPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-fieldset__heading';

  yesButton = 'input[data-automation-id="yes"]';

  noButton = 'input[data-automation-id="no"]';

  telephoneField = '#telephoneNumber';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'nsa/telephone-contact';

  errorLink = 'a[href="contactByTelephone"]';

  errorMessageRadioLocator = 'span[data-automation-id="contactByTelephone-error"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  // content
  pageHeading = 'Would you prefer to be contacted by telephone?';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  errorEnterTelephone = 'Enter a telephone number';

  error50Chars = 'The telephone number must be 50 characters or fewer';

  continueButtonText = 'Continue';

  cancelLinkText = 'keep your existing choice';

  async selectTelephoneContactPreference(telephoneContact: boolean): Promise<void> {
    if (telephoneContact) {
      await click(this.yesButton);
    } else {
      await click(this.noButton);
    }
  }

  async selectTelephonePreferenceNo(): Promise<void> {
    await click(this.noButton);
    await click(this.continueButton);
  }

  async enterTelephoneNumber(telephone: string): Promise<NsaVoicemailPage> {
    await enter(this.telephoneField, telephone);
    await click(this.continueButton);
    return new NsaVoicemailPage();
  }

  async cancelUsingButton(): Promise<void> {
    await click(this.cancelButton);
  }

  async cancelUsingLink(): Promise<void> {
    await link(this.cancelLinkText);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
