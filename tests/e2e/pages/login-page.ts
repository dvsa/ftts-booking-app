import { BasePage } from './base-page';
import {
  enter, click, verifyContainsText,
} from '../utils/helpers';
import ManageBookingsPage from './manage-bookings-page';
import { MAX_TIMEOUT } from '../data/constants';

export class LoginPage extends BasePage {
  pageHeadingLocator = '.govuk-fieldset__heading';

  submitButton = 'button[data-automation-id="submit"]';

  bookingReferenceTextBox = '#bookingReference';

  drivingLicenceTextBox = '#licenceNumber';

  errorMessageLocator = '.govuk-error-message';

  inputHeaderLocator = 'form > h2.govuk-heading-m';

  pathUrl = 'manage-booking/login';

  // Content
  pageHeading = 'Enter the booking reference and driving licence number of the person taking the theory test';

  errorMessageMissing = 'Enter both the booking reference and candidate\'s driving licence number to access this booking';

  errorMessageValidation = 'You must use the most recent driving licence number and the correct booking reference. Please check the details you have entered, then try again.';

  async enterLoginDetails(bookingReference: string, drivingLicence: string): Promise<void> {
    await enter(this.bookingReferenceTextBox, bookingReference);
    await enter(this.drivingLicenceTextBox, drivingLicence);
  }

  async enterLoginDetailsWithSpaces(bookingReference: string, drivingLicence: string): Promise<void> {
    await enter(this.bookingReferenceTextBox, `     ${bookingReference}      `);
    await enter(this.drivingLicenceTextBox, `       ${drivingLicence}        `);
  }

  async submitDetails(): Promise<void> {
    await click(this.submitButton);
  }

  async login(bookingReference: string, drivingLicence: string): Promise<void> {
    await this.enterLoginDetails(bookingReference, drivingLicence);
    await this.submitDetails();
    await verifyContainsText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading, 0, MAX_TIMEOUT);
  }
}
