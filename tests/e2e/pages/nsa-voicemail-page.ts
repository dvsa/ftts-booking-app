/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class NsaVoicemailPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-fieldset__heading';

  yesButton = 'input[data-automation-id="yes"]';

  noButton = 'input[data-automation-id="no"]';

  continueButton = 'button[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'nsa/voicemail';

  errorLink = 'a[href="#voicemail"]';

  errorMessageRadioLocator = 'span[data-automation-id="voicemail-error"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  // content
  pageHeading = 'Can we leave telephone messages if we can\'t reach you?';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  continueButtonText = 'Continue';

  cancelButtonText = 'Cancel and keep existing choice';

  cancelLinkText = 'keep your existing choice';

  async selectVoicemailConsentGiven(voicemailConsent: boolean): Promise<void> {
    if (voicemailConsent) {
      await click(this.yesButton);
    } else {
      await click(this.noButton);
    }
    await click(this.continueButton);
  }

  async editVoicemailConsentGiven(voicemailConsent: boolean): Promise<void> {
    if (voicemailConsent) {
      await click(this.yesButton);
    } else {
      await click(this.noButton);
    }
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
