import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { generalTitle, LANGUAGES } from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  verifyExactText, verifyContainsText, link, capitalizeFirstLetter, convertDateToDisplayFormat, convertTimeToDisplayFormat, verifyTitleContainsText, getVoiceoverOption,
} from '../utils/helpers';
import { BasePage } from './base-page';

export class ChangeConfirmedPage extends BasePage {
  pageTitleLocator = '.govuk-panel__title';

  bookingConfirmationMessageLocator = '.govuk-panel__body';

  bookingReferenceLocator = `${this.bookingConfirmationMessageLocator} > span`;

  testDetailsKey = 'dt.govuk-summary-list__key';

  testDetailsValue = 'dd.govuk-summary-list__value';

  viewAllBookingsButton = '#view-all-bookings';

  makeAnotherChangeButton = '#make-another-change';

  pathUrl = 'check-change';

  // Contents
  pageTitle = 'Test updated';

  pageHeading = 'Theory test updated';

  bookingConfirmationText = 'Your booking reference is important';

  referenceText = 'Keep it safe';

  async checkBookingUpdatedConfirmationPage(sessionData: SessionData) {
    await verifyExactText(this.pageTitleLocator, this.pageHeading, 0, 60000);
    await verifyTitleContainsText(`${this.pageTitle} ${generalTitle}`);
    await verifyContainsText(this.bookingConfirmationMessageLocator, this.bookingConfirmationText);
    await verifyContainsText(this.bookingConfirmationMessageLocator, this.referenceText);
    await verifyContainsText(this.bookingConfirmationMessageLocator, sessionData.currentBooking.bookingRef);

    await verifyExactText(this.testDetailsKey, 'Test type', 0);
    await verifyExactText(this.testDetailsKey, 'Test time and date', 1);
    await verifyExactText(this.testDetailsKey, 'Test location', 2);
    await verifyExactText(this.testDetailsKey, 'On-screen language', 3);
    await verifyExactText(this.testDetailsKey, 'British Sign Language', 4);
    await verifyExactText(this.testDetailsKey, 'Voiceover language', 5);

    await verifyExactText(this.testDetailsValue, capitalizeFirstLetter(sessionData.currentBooking.testType), 0);

    const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
    const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
    const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
    await verifyExactText(this.testDetailsValue, `${expTestTime}, ${expTestDate}`, 1);

    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, 2);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, 2);
    if (sessionData.currentBooking.centre.addressLine2) {
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, 2);
    }
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, 2);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, 2);

    await verifyExactText(this.testDetailsValue, LANGUAGES.get(sessionData.currentBooking.language), 3);
    await verifyExactText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), 4);
    await verifyExactText(this.testDetailsValue, getVoiceoverOption(sessionData), 5);
  }

  async preparingForACarTheoryTest(): Promise<void> {
    await link('www.gov.uk/theory-test/revision-and-practice');
  }

  async freePracticeTests(): Promise<void> {
    await link('www.gov.uk/theory-test/revision-and-practice');
  }

  async changeTheTimeOfThisTest(): Promise<void> {
    await link('www.gov.uk/change-theory-test');
  }

  async cancelTheTest(): Promise<void> {
    await link('www.gov.uk/cancel-theory-test');
  }

  async printPage(): Promise<void> {
    await link('print this page.');
  }
}
