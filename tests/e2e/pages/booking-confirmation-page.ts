import { BasePage } from './base-page';
import {
  capitalizeFirstLetter, convertDateToDisplayFormat, convertTimeToDisplayFormat, link, verifyContainsText, verifyExactText,
} from '../utils/helpers';
import { SessionData } from '../data/session-data';
import { LANGUAGES } from '../data/constants';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';

export class BookingConfirmationPage extends BasePage {
  pageHeadingLocator = '.govuk-panel__title';

  bookingConfirmationMessageLocator = '.govuk-panel__body';

  bookingReferenceLocatorSA = `${this.bookingConfirmationMessageLocator} > span:nth-of-type(2)`;

  bookingReferenceLocatorNSA = `${this.bookingConfirmationMessageLocator} > span:nth-of-type(3)`;

  testKeyLocator = '.govuk-summary-list__key';

  testValueLocator = '.govuk-summary-list__value';

  testLocation1 = '#centreName';

  testLocation2 = '#centreAddressLine1';

  testLocation3 = '#centreAddressLine2';

  testLocation4 = '#centreAddressCity';

  testLocation5 = '#centreAddressPostalCode';

  printPageLink = '#printTrigger';

  headers = '.govuk-heading-l';

  pathUrl = 'booking-confirmation';

  // Contents
  pageTitle = 'Booking confirmed';

  pageHeadingSA = 'Theory test booking confirmed';

  pageHeadingNSA = 'Success: your details have been received';

  bookingConfirmationText = 'Your booking reference is important';

  nsaConfirmationText = 'We will contact you within one working day to arrange your theory test';

  referenceText = 'Keep it safe';

  nsaReferenceText = 'Your reference';

  testTypeText = 'Test type';

  testTimeAndDateText = 'Test time and date';

  testLocationText = 'Test location';

  testLanguageText = 'On-screen language';

  bslText = 'British Sign Language';

  voiceoverText = 'Voiceover language';

  headersText1 = 'Important';

  headersText2 = 'Security at the test centre';

  headersText3 = 'Personal belongings';

  headersText4 = 'No waiting facilities';

  headersText5 = 'Prepare for the test';

  headersText6 = 'Checking, moving or cancelling this theory test';

  async preparingForTheTheoryTest(): Promise<void> {
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

  async checkDataMatchesSession(sessionData: SessionData) {
    await verifyExactText(this.testValueLocator, capitalizeFirstLetter(sessionData.currentBooking.testType), 0);

    const testDateTime = new Date(sessionData.currentBooking.dateTime);
    const expTestTime = convertTimeToDisplayFormat(testDateTime);
    const expTestDate = convertDateToDisplayFormat(testDateTime);
    // const expTestWeekday = testDateTime.toLocaleDateString('en-gb', { weekday: 'long' });
    await verifyContainsText(this.testValueLocator, expTestTime, 1);
    // await verifyContainsText(this.testDetailsLocator, expTestWeekday, 1);
    await verifyContainsText(this.testValueLocator, expTestDate, 1);

    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.name, 2);
    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressLine1, 2);
    if (sessionData.currentBooking.centre.addressLine2) {
      await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressLine2, 2);
    }
    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressCity, 2);
    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressPostalCode, 2);

    await verifyExactText(this.testValueLocator, LANGUAGES.get(sessionData.currentBooking.language), 3);

    await verifyExactText(this.testValueLocator, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), 4);

    // TODO - enable when NSA journey has been re-worked, for now this will not be used
    // await verifyExactText(this.testValueLocator, getVoiceoverOption(sessionData), 5);
  }
}
