/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class AdditionalSupportAdditionalPage extends BasePage {
  pageTitleLocator = '.govuk-heading-xl';

  pageTitle = 'Additional support';

  pageHeading = 'What type of support do you need?';

  continueButton = '#submit';

  backLink = '.govuk-back-link';

  pathUrl = 'additional-support';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
