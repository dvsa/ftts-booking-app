/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { AdditionalSupportOtherPage } from './additional-support-other-page';
import { Voiceover } from '../../../src/domain/enums';

export class NsaVoiceoverPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-fieldset__heading';

  voiceoverButton = 'input[name="voiceover"][value="<>"]';

  continueButton = 'button[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back-link"]';

  pathUrl = 'voiceover';

  errorLink = 'a[href="#voiceover"]';

  errorMessageRadioLocator = 'span[data-automation-id="voiceover-error"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  // content
  pageTitle = 'Choose voiceover';

  pageHeading = 'Which voiceover language do you want?';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  continueButtonText = 'Continue';

  async selectVoiceoverRequired(voiceoverOption: Voiceover): Promise<AdditionalSupportOtherPage> {
    const voiceoverSelector = this.voiceoverButton.replace('<>', voiceoverOption);
    await click(voiceoverSelector);
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
