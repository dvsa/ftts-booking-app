import { BasePage } from './base-page';
import { click, link } from '../utils/helpers';
import { ChangeBookingPage } from './change-booking-page';
import { ChooseSupportPage } from './choose-support-page';
import { RequestRefundPage } from './request-refund-page';

class ManageBookingsPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  backLink = '.govuk-back-link';

  bookingsWithErrorsBanner = 'div[data-automation-id="bookingsWithErrorsBanner"]';

  bookingsWithErrorsBannerTitle = `${this.bookingsWithErrorsBanner} h2`;

  bookingsWithErrorsBannerHeader = `${this.bookingsWithErrorsBanner} .govuk-notification-banner__heading`;

  bookingsWithErrorsBannerContent = `${this.bookingsWithErrorsBanner} .govuk-notification-banner__content`;

  bookingsWithErrorsBannerBookingRefList = `${this.bookingsWithErrorsBanner} > .govuk-list`;

  compensationBanner = 'div[data-automation-id="bookingsWithCompensationEligible"]';

  compensationBannerTitle = `${this.compensationBanner} h2`;

  compensationBannerHeader = `${this.compensationBanner} .govuk-notification-banner__heading`;

  compensationBannerBookTestLink = `${this.compensationBannerHeader} .govuk-link`;

  table = '.govuk-table';

  tableHead = 'thead > tr > th';

  tableRow = 'tbody > tr';

  tableCell = `${this.tableRow} > td`;

  bookReplacementTestLink = `${this.tableCell} a[aria-label*='Book replacement test for booking reference <BookingReference>']`;

  requestRefundLink = `${this.tableCell} a[aria-label*='request refund for booking reference <BookingReference>']`;

  buttonViewLocator = `${this.tableRow} .govuk-button`;

  changeBookingWithReference = 'a[href=\'<BookingReference>\']';

  bookedLabel = 'strong[class="govuk-tag govuk-tag--green"]';

  cancelledCompensationBookingLabel = 'strong[class="govuk-tag govuk-tag--blue"]';

  pathUrl = 'manage-booking/home';

  // Content
  pageHeading = 'Your theory test bookings';

  infoBannerHeaderText = 'A technical problem means these test bookings cannot be found:';

  compensationBannerText = 'One or more of your booked theory tests have been cancelled. You can book a replacement test using the fee already paid or request a fee refund.';

  bookAnotherTestLinkText = 'book another theory test here';

  bookAnotherTestText = `You can ${this.bookAnotherTestLinkText}.`;

  compensationBannerBookTestLinkText = 'book a replacement test';

  bookCompensationTestLinkText = 'Book replacement test';

  requestRefundLinkText = 'request refund';

  column1 = 'Test type';

  column2 = 'Date of test';

  column3 = 'Booking reference';

  column4 = 'Status';

  column5 = 'Actions';

  TEST_TYPE_INDEX = 0;

  TEST_DATE_INDEX = 1;

  BOOKING_REFERENCE_INDEX = 2;

  STATUS_INDEX = 3;

  ACTIONS_INDEX = 4;

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

  async requestRefundForBookingReference(bookingReference: string): Promise<RequestRefundPage> {
    const requestRefundLink = this.requestRefundLink.replace('<BookingReference>', bookingReference);
    await click(requestRefundLink);
    return new RequestRefundPage();
  }
}

export default new ManageBookingsPage();
