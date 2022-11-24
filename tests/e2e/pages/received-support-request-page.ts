/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class ReceivedSupportRequestPage extends BasePage {
  headingLocator = 'h1[data-automation-id="main-heading"]';

  continueWithBookingButton = 'a[role="button"]';

  backLink = 'a[data-automation-id="back"]';

  // Contents
  pageHeading = 'We have received a support request';

  pathUrl = 'received-support-request';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async continueAndMakeBooking(): Promise<void> {
    await click(this.continueWithBookingButton);
  }
}
