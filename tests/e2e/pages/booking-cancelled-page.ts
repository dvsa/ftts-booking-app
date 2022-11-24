/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class BookingCancelledPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-heading-xl';

  startAgainButton = '#startButton';

  pathUrl = 'payment-confirmation';

  // content
  pageHeading = 'Booking process cancelled';

  pageHeadingCy = 'Canslwyd y broses archebu';

  startAgainButtonText = 'Start again';

  startAgainButtonTextCy = 'Dechrau eto';

  async startBookingAgain(): Promise<void> {
    await click(this.startAgainButton);
  }
}
