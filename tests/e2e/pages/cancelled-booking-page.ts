import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { ChooseSupportPage } from './choose-support-page';

export class CancelledBookingPage extends BasePage {
  pageHeadingLocator = '.govuk-panel__title';

  refNumberLocator = '.govuk-panel__body';

  messageLocator = '.govuk-body';

  bookANewTestButtonLocator = '#bookNewTest';

  changeAnotherBookingButtonLocator = '#changeBooking';

  testDetailsKey = '.govuk-summary-list__key';

  testDetailsValue = '.govuk-summary-list__value';

  // Content
  pageHeading = 'Theory test cancelled';

  refNumberText = 'Your reference number';

  messageText = 'This driving theory test has been cancelled.';

  bookANewTestButtonText = 'Book a new theory test';

  changeAnotherBookingButtonText = 'Change another booking';

  async bookANewTest(): Promise<ChooseSupportPage> {
    await click(this.bookANewTestButtonLocator);
    return new ChooseSupportPage();
  }

  async changeAnotherBooking(): Promise<void> {
    await click(this.changeAnotherBookingButtonLocator);
  }
}
