/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class DuplicateSupportRequestPage extends BasePage {
  headingLocator = 'h1[data-automation-id="heading"]';

  backLink = 'a[data-automation-id="back"]';

  // Contents
  pageHeading = 'We have already received a Support Request';

  pathUrl = 'duplicate-support-request';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
