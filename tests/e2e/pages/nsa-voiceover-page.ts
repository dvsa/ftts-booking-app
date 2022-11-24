/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, link } from '../utils/helpers';
import { Voiceover } from '../../../src/domain/enums';

export class NsaVoiceoverPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-fieldset__heading';

  updateBanner = 'div.alert';

  voiceoverButton = 'input[name="voiceover"][value="<>"]';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back-link"]';

  errorLink = 'a[href="#voiceover"]';

  errorMessageRadioLocator = 'span[data-automation-id="voiceover-error"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  pathUrl = 'nsa/change-voiceover';

  // content
  pageHeading = 'Which voiceover language do you want?';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  continueButtonText = 'Continue';

  updateBannerText = 'You can change your mind here about hearing a voiceover used during the test, or';

  updateButtonText = 'Confirm change and continue';

  cancelButtonText = 'Cancel and keep your existing choice';

  cancelLinkText = 'go back and keep your previous choice';

  getRadioSelector(voiceoverOption: Voiceover): string {
    return this.voiceoverButton.replace('<>', voiceoverOption);
  }

  async selectVoiceoverRequired(voiceoverOption: Voiceover): Promise<void> {
    const voiceoverSelector = this.getRadioSelector(voiceoverOption);
    await click(voiceoverSelector);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async goBackAndRequestTranslator(): Promise<void> {
    await link('return to the previous screen');
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
