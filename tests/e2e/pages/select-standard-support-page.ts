/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { SupportType } from '../../../src/domain/enums';

export class SelectStandardSupportPage extends BasePage {
  // locators
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  supportTypeRadioButton = 'input[name="selectStandardSupportType"][value="<>"]';

  onScreenBslRadioButton = 'input[data-automation-id="support-onScreenBsl"]';

  voiceoverRadioButton = 'input[data-automation-id="support-voiceover"]';

  noSupportRadioButton = 'input[data-automation-id="support-noSupportWanted"]';

  continueButton = 'button[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'select-standard-support';

  errorLink = 'a[href="#voiceover"]';

  errorMessageRadioLocator = '#voiceover-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  // content
  pageHeading = 'Which support would you like?';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  async selectSupportTypeRequired(supportType: SupportType): Promise<void> {
    const supportTypeSelector = this.supportTypeRadioButton.replace('<>', supportType);
    await click(supportTypeSelector);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
