/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class BookingExistsPage extends BasePage {
  headingLocator = 'h1[data-automation-id="main-heading"]';

  manageBookingLink = 'a[data-automation-id="manage-booking-login-link"]';

  backLink = 'a[data-automation-id="back"]';

  // Contents
  pageHeading = 'A confirmed booking for this test already exists';

  manageBookingLinkText = 'check your theory test appointment details';

  pathUrl = 'booking-exists';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async goToManageBooking(): Promise<void> {
    await click(this.manageBookingLink);
  }
}
