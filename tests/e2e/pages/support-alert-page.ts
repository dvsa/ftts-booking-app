/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class SupportAlertPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  headingLocator = 'button[data-automation-id="heading"]';

  continueWithSupportButton = 'button[data-automation-id="submit"]';

  bookWithoutSupportButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back"]';

  // Contents
  pageHeading = 'Before you continue with your support request';

  pathUrl = 'support-alert';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async continueAndGetSupport(): Promise<void> {
    await click(this.continueWithSupportButton);
  }

  async bookWithoutSupport(): Promise<void> {
    await click(this.bookWithoutSupportButton);
  }
}
