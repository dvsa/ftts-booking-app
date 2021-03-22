import { t, Selector } from 'testcafe';
import { BasePage } from './base-page';
import {
  capitalizeFirstLetter, click, convertDateToDisplayFormat, convertTimeToDisplayFormat, verifyContainsText, verifyExactText,
} from '../utils/helpers';
import { TARGET } from '../../../src/domain/enums';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { LANGUAGES } from '../data/constants';
import { SessionData } from '../data/session-data';
import { WhatDoYouWantToChangePage } from './what-do-you-want-to-change-page';
import { LanguagePage } from './language-page';
import { AdditionalSupportVoiceoverPage } from './additional-support-voiceover-page';
import { AdditionalSupportBslPage } from './additional-support-bsl-page';

export class ChangeBookingPage extends BasePage {
  pageTitleLocator = '.govuk-heading-xl';

  backLink = '.govuk-back-link';

  warningIcon = 'span.govuk-warning-text__icon';

  warningMessageLocator = '.govuk-warning-text__text';

  testDetailsLocator = '.govuk-summary-list';

  testDetailsRow = `${this.testDetailsLocator} .govuk-summary-list__row`;

  testDetailsKey = `${this.testDetailsLocator} dt.govuk-summary-list__key`;

  testDetailsValue = `${this.testDetailsLocator} dd.govuk-summary-list__value`;

  testDetailsAction = `${this.testDetailsLocator} dd.govuk-summary-list__actions > a`;

  BOOKING_REFERENCE_INDEX = 0;

  TEST_TYPE_INDEX = 1;

  TEST_TIME_DATE_INDEX = 2;

  TEST_LOCATION_INDEX = 3;

  TEST_LANGUAGE_INDEX = 4;

  REQUESTED_BSL_INDEX = 5;

  REQUESTED_VOICEOVER_INDEX = 6;

  CANCEL_TEST_INDEX = 7;

  // Content
  pageTitle = 'Change, reschedule or cancel test';

  pageHeading = 'Change, reschedule or cancel this theory test';

  refundWarningMessageText = 'You cannot get a refund or reschedule this test after';

  noChangeAllowedWarningMessageText = 'This test is today. Changes are no longer possible.';

  cancelText ='Cancel this test';

  cancelButtonText = 'Cancel test';

  changeText = 'Change';

  async changeTestType(): Promise<void> {
    await click(this.testDetailsAction, this.TEST_TYPE_INDEX);
  }

  async rescheduleTest(): Promise<WhatDoYouWantToChangePage> {
    await click(this.testDetailsAction, this.TEST_TIME_DATE_INDEX);
    return new WhatDoYouWantToChangePage();
  }

  async changeTestLanguage(): Promise<LanguagePage> {
    await click(this.testDetailsAction, this.TEST_LANGUAGE_INDEX);
    return new LanguagePage();
  }

  async changeRequestBsl(): Promise<AdditionalSupportBslPage> {
    await click(this.testDetailsAction, this.REQUESTED_BSL_INDEX);
    return new AdditionalSupportBslPage();
  }

  async changeRequestVoiceover(): Promise<AdditionalSupportVoiceoverPage> {
    await click(this.testDetailsAction, this.REQUESTED_VOICEOVER_INDEX);
    return new AdditionalSupportVoiceoverPage();
  }

  async cancelTest(): Promise<void> {
    await click(this.testDetailsAction, this.CANCEL_TEST_INDEX);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async checkDataMatchesSession(sessionData: SessionData) {
    // field names
    await verifyExactText(this.testDetailsKey, 'Booking reference', this.BOOKING_REFERENCE_INDEX);
    await verifyExactText(this.testDetailsKey, 'Test type', this.TEST_TYPE_INDEX);
    await verifyExactText(this.testDetailsKey, 'Test time and date', this.TEST_TIME_DATE_INDEX);
    await verifyExactText(this.testDetailsKey, 'Test location', this.TEST_LOCATION_INDEX);
    await t.expect(Selector(this.testDetailsRow).nth(this.TEST_LANGUAGE_INDEX).visible).ok('Test Language row was not visible');
    await verifyExactText(this.testDetailsKey, 'On-screen language', this.TEST_LANGUAGE_INDEX);
    await verifyExactText(this.testDetailsKey, 'British Sign Language', this.REQUESTED_BSL_INDEX);
    await verifyExactText(this.testDetailsKey, 'Voiceover language', this.REQUESTED_VOICEOVER_INDEX);
    await verifyExactText(this.testDetailsKey, this.cancelText, this.CANCEL_TEST_INDEX);

    // field values
    await verifyExactText(this.testDetailsValue, sessionData.currentBooking.bookingRef, this.BOOKING_REFERENCE_INDEX);
    await verifyExactText(this.testDetailsValue, capitalizeFirstLetter(sessionData.currentBooking.testType), this.TEST_TYPE_INDEX);

    const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
    const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
    const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
    await verifyContainsText(this.testDetailsValue, expTestTime, this.TEST_TIME_DATE_INDEX);
    await verifyContainsText(this.testDetailsValue, expTestDate, this.TEST_TIME_DATE_INDEX);

    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, this.TEST_LOCATION_INDEX);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, this.TEST_LOCATION_INDEX);
    if (sessionData.currentBooking.centre.addressLine2) {
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, this.TEST_LOCATION_INDEX);
    }
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, this.TEST_LOCATION_INDEX);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, this.TEST_LOCATION_INDEX);

    await verifyExactText(this.testDetailsValue, LANGUAGES.get(sessionData.currentBooking.language), this.TEST_LANGUAGE_INDEX);
    await verifyExactText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), this.REQUESTED_BSL_INDEX);
    // TODO enable when Non-standard accommodation journeys have been finalised
    // await verifyExactText(this.testDetailsValue, TestVoiceover.availableOptions(sessionData.target as TARGET).get(sessionData.currentBooking.voiceover), this.REQUESTED_VOICEOVER_INDEX);

    // field actions
    if (sessionData.testDateLessThan3Days) { // change button should be hidden
      await t.expect(Selector(this.testDetailsAction).nth(this.TEST_TYPE_INDEX).visible).notOk('Change Test Type was visible');
      await t.expect(Selector(this.testDetailsAction).nth(this.TEST_TIME_DATE_INDEX).visible).notOk('Change Test Time Date was visible');
      await t.expect(Selector(this.testDetailsAction).nth(this.TEST_LOCATION_INDEX).visible).notOk('Change Test Location was visible');
      await t.expect(Selector(this.testDetailsAction).nth(this.TEST_LANGUAGE_INDEX).visible).notOk('Change Test Language was visible');
      await t.expect(Selector(this.testDetailsAction).nth(this.REQUESTED_BSL_INDEX).visible).notOk('Change BSL was visible');
      // await t.expect(Selector(this.testDetailsAction).nth(this.REQUESTED_VOICEOVER_INDEX).visible).notOk('Change Voiceover was visible');
    } else {
      await t.expect(Selector(this.testDetailsAction).nth(this.TEST_TYPE_INDEX).visible).ok('Change Test Type was not visible');
      await t.expect(Selector(this.testDetailsAction).nth(this.TEST_TIME_DATE_INDEX).visible).ok('Change Test Time Date was not visible');
      await t.expect(Selector(this.testDetailsAction).nth(this.TEST_LOCATION_INDEX).visible).notOk('Change Test Location was visible');
      if (sessionData.target === TARGET.GB) {
        await t.expect(Selector(this.testDetailsAction).nth(this.TEST_LANGUAGE_INDEX).visible).ok('Change Test Language was not visible');
      } else {
        await t.expect(Selector(this.testDetailsAction).nth(this.TEST_LANGUAGE_INDEX).visible).notOk('Change Test Language action was visible');
      }
      await t.expect(Selector(this.testDetailsAction).nth(this.REQUESTED_BSL_INDEX).visible).ok('Change BSL was not visible');
      // await t.expect(Selector(this.testDetailsAction).nth(this.REQUESTED_VOICEOVER_INDEX).visible).ok('Change Voiceover was not visible');
    }
    await verifyContainsText(this.testDetailsAction, this.cancelButtonText, this.CANCEL_TEST_INDEX);
  }
}
