import { BasePage } from './base-page';
import { click, link } from '../utils/helpers';
import { ChangeBookingPage } from './change-booking-page';
import { ChooseSupportPage } from './choose-support-page';

export class ManageBookingsPage extends BasePage {
  pageTitleLocator = '.govuk-heading-xl';

  backLink = '.govuk-back-link';

  infoBanner = '#govuk-notification-banner-title';

  infoBannerHeader = '.govuk-notification-banner__heading';

  infoBannerContent = '.govuk-notification-banner__content';

  infoBannerBookingRefList = `${this.infoBannerContent} > .govuk-list`;

  contentLocator = `${this.pageTitleLocator} ~ p.govuk-body`;

  table = '.govuk-table';

  tableHead = 'thead > tr > th';

  tableRow = 'tbody > tr';

  tableCell = `${this.tableRow} > td`;

  buttonViewLocator = '.govuk-button';

  changeBookingWithReference = 'form[action=\'<BookingReference>\'] > button';

  pathUrl = 'manage-booking/home';

  // Content
  pageTitle = 'Your theory test bookings';

  infoBannerHeaderText = 'A technical problem means these test bookings cannot be found:';

  theoryTestsText = 'You have X theory tests booked.';

  bookAnotherTestLinkText = 'book another theory test here';

  bookAnotherTestText = `You can ${this.bookAnotherTestLinkText}.`;

  column1 = 'Test type';

  column2 = 'Test time and date';

  column3 = 'Booking reference';

  buttonView = 'View booking';

  TEST_TYPE_INDEX = 0;

  TEST_DATE_INDEX = 1;

  BOOKING_REFERENCE_INDEX = 2;

  CHANGE_TEST_INDEX = 3;

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async bookAnotherTest(): Promise<ChooseSupportPage> {
    await link(this.bookAnotherTestLinkText);
    return new ChooseSupportPage();
  }

  async viewTestWithBookingReference(bookingReference: string): Promise<ChangeBookingPage> {
    const changeButton = this.changeBookingWithReference.replace('<BookingReference>', bookingReference);
    await click(changeButton);
    return new ChangeBookingPage();
  }
}
