/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { Voiceover } from '../../../src/domain/enums';

export class VoiceoverPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-fieldset__heading';

  voiceoverRadio = 'input[name="voiceover"]';

  voiceoverButton = 'input[name="voiceover"][value="<>"]';

  noVoiceoverRadioButton = 'input[name="voiceover"][value="none"]';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back-link"]';

  pathUrl = 'change-voiceover';

  errorLink = 'a[href="#voiceover"]';

  errorMessageRadioLocator = '#voiceover-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  updateLanguageBanner = 'div.alert';

  // content
  pageHeading = 'Do you want a voiceover used during the test?';

  errorMessageHeader = 'There is a problem';

  errorMessageTextGB = 'You must select one option.';

  errorMessageTextNI = 'You must select a voiceover language. Alternatively, select \'I do not want a voiceover\'.';

  updateButtonText = 'Confirm change and continue';

  cancelButtonText = 'Cancel and keep your existing choice';

  cancelLinkText = 'go back and keep your previous choice';

  updateBannerText = 'You can change your mind here about hearing a voiceover used during the test, or';

  async selectVoiceoverRequired(voiceoverOption: Voiceover): Promise<void> {
    const voiceoverSelector = this.voiceoverButton.replace('<>', voiceoverOption);
    await click(voiceoverSelector);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
