import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { ChooseSupportPage } from './choose-support-page';

export class RefundRequestedPage extends BasePage {
  pageHeadingLocator = '.govuk-panel__title';

  refNumberLocator = '.govuk-panel__body';

  messageLocator = '.govuk-body';

  bookANewTestButtonLocator = '#book-new-test';

  changeAnotherBookingButtonLocator = '#change-booking';

  // Content
  pageHeading = 'Refund request sent';

  refNumberText = 'Your reference number';

  bookANewTestButtonText = 'Book a new theory test';

  changeAnotherBookingButtonText = 'Manage existing test bookings';

  async bookANewTest(): Promise<ChooseSupportPage> {
    await click(this.bookANewTestButtonLocator);
    return new ChooseSupportPage();
  }

  async changeAnotherBooking(): Promise<void> {
    await click(this.changeAnotherBookingButtonLocator);
  }
}
