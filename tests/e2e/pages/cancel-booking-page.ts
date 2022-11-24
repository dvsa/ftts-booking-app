import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class CancelBookingPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  messageLocator = '.govuk-body + p';

  textLocator1 = 'h2';

  textLocator3 = 'h3';

  textLocator4 = '.govuk-body';

  textLocator6 = '.govuk-inset-text';

  backLink = '.govuk-back-link';

  cancelButtonLocator = 'button[data-automation-id="cancel"]';

  keepButtonLocator = 'a[data-automation-id="keep"]';

  // Content
  pageHeading = 'Cancel this theory test';

  confirmCancellationButtonText = 'Confirm theory test cancellation';

  keepExistingBookingButtonText = 'Keep existing booking';

  messageText = 'Select one option. When you select ‘Confirm theory test cancellation’ your existing booking will be permanently removed.';

  text1 = 'Help with your booking';

  text2 = 'Contact the Driver and Vehicle Standards Agency (DVSA) to get help cancelling your theory test appointment.';

  text3 = 'DVSA theory test booking support';

  text4 = 'theorycustomerservices@dvsa.gov.uk';

  text5 = 'Telephone 0300 200 1122';

  text6 = 'There\'s a different service to cancel your theory test in Northern Ireland.';

  async confirmCancellation(): Promise<void> {
    await click(this.cancelButtonLocator);
  }

  async keepExistingBooking(): Promise<void> {
    await click(this.keepButtonLocator);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
