/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';
import { AdditionalSupportAdditionalPage } from './additional-support-additional-page';

export class AdditionalSupportOtherPage extends BasePage {
  pageTitleLocator = '.govuk-fieldset__heading';

  pageTitle = 'Other support';

  pageHeading = 'Would you like any other type of support not mentioned?';

  otherSupportOptionYes = 'input[id=yes]';

  otherSupportOptionNo = 'input[id=no]';

  continueButton = '#submit';

  backLink = '.govuk-back-link';

  pathUrl = 'other-support';

  async selectNoOtherSupportRequired(): Promise<FindATheoryTestCentrePage> {
    await click(this.otherSupportOptionNo);
    await click(this.continueButton);
    return new FindATheoryTestCentrePage();
  }

  async selectYesOtherSupportRequired(): Promise<AdditionalSupportAdditionalPage> {
    await click(this.otherSupportOptionYes);
    await click(this.continueButton);
    return new AdditionalSupportAdditionalPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
