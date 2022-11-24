/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class SelectSupportTypePage extends BasePage {
  // contents
  pageHeading = 'What test support do you need?';

  errorMessageHeader = 'There is a problem';

  errorMessageNothingSelectText = 'You must select at least one option. If the support you want is not listed, select \'I need something else\'.';

  errorMessageBslVoiceoverSelectedText = 'You have selected sign language and voiceover. Please select only one of these options. If the support you want is not listed, select \'I need something else\'.';

  updateBannerText = 'You can tell us more about the support you need here. Or you can use the information you have already provided.';

  updateBannerWarningText = 'If you change your choices here, all details previously entered will be replaced.';

  updateButtonText = 'Confirm change and continue';

  cancelButtonText = 'Cancel and use information already provided';

  cancelLinkText = 'use the information you have already provided';

  // locators
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  updateBanner = 'div.alert';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'nsa/select-support-type';

  genericOptionLocator = 'input[data-automation-id="support-<>"]';

  onScreenBslOption = 'input[data-automation-id="support-onScreenBsl"]';

  bslInterpreterOption = 'input[data-automation-id="support-bslInterpreter"]';

  voiceoverOption = 'input[data-automation-id="support-voiceover"]';

  translatorOption = 'input[data-automation-id="support-translator"]';

  extraTimeOption = 'input[data-automation-id="support-extraTime"]';

  questionModifierOption = 'input[data-automation-id="support-questionModifier"]';

  readingSupportOption = 'input[data-automation-id="support-readingSupport"]';

  otherOption = 'input[data-automation-id="support-other"]';

  errorLink = 'a[href="#selectSupportType"]';

  errorMessageFieldLocator = '#selectSupportType-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  getOptionSelector(supportType: string): string {
    return this.genericOptionLocator.replace('<>', supportType);
  }

  async selectSupportTypes(supportTypes: string[]): Promise<void> {
    for (let index = 0; index < supportTypes.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      await click(this.getOptionSelector(supportTypes[index]));
    }
    await this.continue();
  }

  async continue(): Promise<void> {
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
