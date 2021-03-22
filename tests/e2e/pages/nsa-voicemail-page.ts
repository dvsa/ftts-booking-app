/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { AdditionalSupportOtherPage } from './additional-support-other-page';

export class NsaVoicemailPage extends BasePage {
  // locators
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  yesButton = 'input[data-automation-id="yes"]';

  noButton = 'input[data-automation-id="no"]';

  continueButton = 'button[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'voicemail';

  errorLink = 'a[href="#voicemail"]';

  errorMessageRadioLocator = 'span[data-automation-id="voicemail-error"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  // content
  pageTitle = 'Voicemail';

  pageHeading = 'Can we leave telephone messages if we can\'t reach you?';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  continueButtonText = 'Continue';

  async selectVoicemailRequired(): Promise<AdditionalSupportOtherPage> {
    await click(this.yesButton);
    await click(this.continueButton);
    return new AdditionalSupportOtherPage();
  }

  async selectVoicemailNotRequired(): Promise<AdditionalSupportOtherPage> {
    await click(this.noButton);
    await click(this.continueButton);
    return new AdditionalSupportOtherPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
