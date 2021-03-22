/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class StayingNSAPage extends BasePage {
  // contents
  pageTitle = 'Staying NSA';

  pageHeading = 'We\'ll contact you about support for your theory test';

  // locators
  pageHeadingLocator = '.govuk-heading-xl';

  continueButton = 'button[data-automation-id="continue"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'staying-nsa';

  async continue(): Promise<void> {
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
