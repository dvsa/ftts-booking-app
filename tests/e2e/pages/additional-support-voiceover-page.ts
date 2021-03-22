/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { AdditionalSupportOtherPage } from './additional-support-other-page';
import { Voiceover } from '../../../src/domain/enums';

export class AdditionalSupportVoiceoverPage extends BasePage {
  // locators
  pageTitleLocator = '.govuk-fieldset__heading';

  voiceoverButton = 'input[name="voiceover"][value="<>"]';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back-link"]';

  pathUrl = 'voiceover';

  errorLink = 'a[href="#voiceover"]';

  errorMessageRadioLocator = 'span[data-automation-id="voiceover-error"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  updateLanguageBanner = 'div.alert';

  // content
  pageTitle = 'Choose voiceover';

  pageHeadingGB = 'Do you want a voiceover used during the test?';

  pageHeadingNI = 'Which voiceover language do you want?';

  errorMessageHeader = 'There is a problem';

  errorMessageTextGB = 'You must select one option.';

  errorMessageTextNI = 'You must select a voiceover language. Alternatively, select \'I do not want a voiceover\'.';

  updateButtonText = 'Confirm change and continue';

  cancelButtonText = 'Cancel and keep your existing choice';

  cancelLinkText = 'go back and keep your previous choice';

  updateBannerText = 'You can change your mind here about hearing a voiceover used during the test, or';

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
