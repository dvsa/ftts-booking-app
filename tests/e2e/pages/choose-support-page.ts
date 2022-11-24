/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class ChooseSupportPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-heading-xl';

  chooseSupportOption = 'input[name="chooseSupport"][value="<>"]';

  errorLink = 'a[href="#chooseSupport"]';

  errorMessageRadioLocator = '#chooseSupport-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  continueButton = 'button[data-automation-id="submit"]';

  yesRadioButton = 'input[data-automation-id="support-yes"]';

  noRadioButton = 'input[data-automation-id="support-no"]';

  backLink = '.govuk-back-link';

  pathUrl = 'choose-support';

  // content
  pageHeading = 'Get the right support during your theory test';

  pageHeadingCy = 'Sicrhau’r cymorth cywir yn ystod eich prawf theori';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select either \'Yes\' or \'No\'.';

  async selectSupportRequired(yesOrNo: boolean): Promise<void> {
    if (yesOrNo) {
      await click(this.yesRadioButton);
    } else {
      await click(this.noRadioButton);
    }
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
