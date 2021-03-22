/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class SelectSupportTypePage extends BasePage {
  // contents
  pageTitle = 'Which type of support do you need';

  pageHeading = 'What test support do you want?';

  errorMessageHeader = 'There is a problem';

  errorMessageNothingSelectText = 'You must select at least one option. If the support you want is not listed, select \'Other\'';

  errorMessageBslVoiceoverSelectedText = 'You have selected sign language and voiceover. Please select only one of these options. If the support you want is not listed, select \'Other.\'';

  // locators
  pageHeadingLocator = '.govuk-heading-xl';

  continueButton = 'button[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'select-support-type';

  bslOption = 'input[data-automation-id="support-option1"]';

  bslInterpreterOption = 'input[data-automation-id="support-option2"]';

  voiceoverOption = 'input[data-automation-id="support-option3"]';

  translatorOption = 'input[data-automation-id="support-option4"]';

  extraTimeOption = 'input[data-automation-id="support-option5"]';

  oralLanguageModifierOption = 'input[data-automation-id="support-option6"]';

  someoneReadOption = 'input[data-automation-id="support-option7"]';

  otherOption = 'input[data-automation-id="support-option8"]';

  errorLink = 'a[href="#voiceover"]';

  errorMessageRadioLocator = '#voiceover-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  async continue(): Promise<void> {
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
