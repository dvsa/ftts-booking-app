/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { capitalizeFirstLetter, click, clickWithText } from '../utils/helpers';
import { CandidateDetailsPage } from './candidate-details-page';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';

export class ChooseSupportPage extends BasePage {
  // locators
  pageTitleLocator = '.govuk-heading-xl';

  chooseSupportOption = 'input[name="chooseSupport"][value="<>"]';

  errorLink = 'a[href="#chooseSupport"]';

  errorMessageRadioLocator = '#chooseSupport-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  continueButton = '.govuk-button';

  backLink = '.govuk-back-link';

  pathUrl = 'choose-support';

  // content
  pageTitle = 'Do you need support';

  pageHeading = 'Get the right support during your theory test';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You must select one option.';

  async selectSupportRequired(yesOrNo: boolean): Promise<CandidateDetailsPage> {
    await clickWithText('label', capitalizeFirstLetter(YesOrNo.fromBoolean(yesOrNo).toString()));
    await click(this.continueButton);
    return new CandidateDetailsPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
