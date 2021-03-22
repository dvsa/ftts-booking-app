import { BasePage } from './base-page';
import {
  enter, click, verifyContainsText,
} from '../utils/helpers';
import { ManageBookingsPage } from './manage-bookings-page';

export class LoginPage extends BasePage {
  pageTitleLocator = '.govuk-fieldset__heading';

  submitButton = 'button[data-automation-id="submit"]';

  bookingReferenceTextBox = '#bookingReference';

  drivingLicenceTextBox = '#licenceNumber';

  backLink = '.govuk-back-link';

  errorMessageLocator = '.govuk-error-message';

  inputHeaderLocator = 'h2.govuk-heading-m';

  pathUrl = 'manage-booking/login';

  // Content
  pageTitle = 'Booking reference and driving licence number';

  pageHeading= 'Enter the booking reference and driving licence number of the person taking the theory test';

  errorMessageMissing = 'Enter both the booking reference and candidate\'s driving licence number to access this booking';

  errorMessageValidation = 'This booking cannot be accessed using the information entered. Check both the booking reference and driving licence number are correct and try again.';

  async enterLoginDetails(bookingReference: string, drivingLicence: string): Promise<void> {
    await enter(this.bookingReferenceTextBox, bookingReference);
    await enter(this.drivingLicenceTextBox, drivingLicence);
  }

  async submitDetails(): Promise<ManageBookingsPage> {
    await click(this.submitButton);
    return new ManageBookingsPage();
  }

  async login(bookingReference: string, drivingLicence: string): Promise<void> {
    await this.enterLoginDetails(bookingReference, drivingLicence);
    const manageBookingsPage = await this.submitDetails();
    await verifyContainsText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle, 0, 60000);
    await verifyContainsText(manageBookingsPage.contentLocator, manageBookingsPage.bookAnotherTestText, 1);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
