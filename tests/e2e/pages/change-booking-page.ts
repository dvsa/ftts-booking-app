import { t, Selector } from 'testcafe';
import dayjs from 'dayjs';
import { BasePage } from './base-page';
import {
  capitalizeFirstLetter, click, convertDateToDisplayFormat, convertTimeToDisplayFormat, getVoiceoverOption, verifyContainsText, verifyExactText,
} from '../utils/helpers';
import { Target, TestType, Voiceover } from '../../../src/domain/enums';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { Languages, ManageBookingActionTypes, TestTypeName } from '../data/constants';
import { SessionData } from '../data/session-data';
import { WhatDoYouWantToChangePage } from './what-do-you-want-to-change-page';
import { LanguagePage } from './language-page';
import { VoiceoverPage } from './voiceover-page';
import { BslPage } from './bsl-page';
import { CRMTestSupportNeed } from '../../../src/services/crm-gateway/enums';

export class ChangeBookingPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  backLink = '.govuk-back-link';

  warningIcon = 'span.govuk-warning-text__icon';

  warningMessageLocator = '.govuk-warning-text__text';

  testDetailsLocator = '.govuk-summary-list';

  testDetailsRow = `${this.testDetailsLocator} .govuk-summary-list__row`;

  testDetailsKey = `${this.testDetailsLocator} dt.govuk-summary-list__key`;

  testDetailsValue = `${this.testDetailsLocator} dd.govuk-summary-list__value`;

  testDetailsAction = `${this.testDetailsLocator} dd.govuk-summary-list__actions > a`;

  changeTimeLink = 'a[data-automation-id="change-time"]';

  changeLanguageLink = 'a[data-automation-id="change-language"]';

  changeBslLink = 'a[data-automation-id="change-bsl"]';

  changeVoiceoverLink = 'a[data-automation-id="change-voiceover"]';

  cancelTestButton = 'dd > a[href*="cancel"]';

  BOOKING_REFERENCE_ROW_INDEX = 0;

  TEST_TYPE_ROW_INDEX = 1;

  TEST_TIME_DATE_ROW_INDEX = 2;

  TEST_LOCATION_ROW_INDEX = 3;

  TEST_LANGUAGE_ROW_INDEX = 4;

  REQUESTED_BSL_ROW_INDEX = 5;

  REQUESTED_VOICEOVER_ROW_INDEX = 6;

  CANCEL_TEST_ROW_INDEX = 7;

  TEST_SUPPORT_ROW_INDEX = 8;

  // Content
  pageHeading = 'Change, reschedule or cancel this theory test';

  refundWarningMessageTextBookingToday = 'Booking cannot be cancelled or refunded on the day they are booked.';

  refundWarningMessageText = 'You cannot get a refund or reschedule this test after';

  niInstructorRescheduleWarningMessageText = 'You cannot reschedule this test after';

  noChangeAllowedTodayText = 'This test is today. Changes are no longer possible.';

  noChangeAllowedBlockedOnlineText = 'You cannot make changes to this theory test. Please contact DVSA.';

  noChangeAllowedTextDVSA = 'You cannot make changes to this theory test. Please contact DVSA.';

  noChangeAllowedTextDVA = 'You cannot make changes to this theory test. Please contact DVA.';

  cancelText = 'Cancel this test';

  cancelButtonText = 'Cancel test';

  changeText = 'Change';

  voiceoverWarningText = 'To add voiceover to this test you must first remove sign language';

  bslWarningText = 'To add sign language to this test you must first remove voiceover';

  async rescheduleTest(): Promise<WhatDoYouWantToChangePage> {
    await click(this.changeTimeLink);
    return new WhatDoYouWantToChangePage();
  }

  async changeTestLanguage(): Promise<LanguagePage> {
    await click(this.changeLanguageLink);
    return new LanguagePage();
  }

  async changeRequestBsl(): Promise<BslPage> {
    await click(this.changeBslLink);
    return new BslPage();
  }

  async changeRequestVoiceover(): Promise<VoiceoverPage> {
    await click(this.changeVoiceoverLink);
    return new VoiceoverPage();
  }

  async cancelTest(): Promise<void> {
    await click(this.cancelTestButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async checkDataMatchesSession(sessionData: SessionData): Promise<void> {
    // field names
    if (!sessionData.journey.isInstructor) {
      await verifyContainsText(this.testDetailsKey, 'Booking reference', this.BOOKING_REFERENCE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test type', this.TEST_TYPE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test time and date', this.TEST_TIME_DATE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test location', this.TEST_LOCATION_ROW_INDEX);
      await t.expect(Selector(this.testDetailsRow).nth(this.TEST_LANGUAGE_ROW_INDEX).visible).ok('Test Language row was not visible');
      await verifyContainsText(this.testDetailsKey, 'On-screen language', this.TEST_LANGUAGE_ROW_INDEX);

      await verifyContainsText(this.testDetailsKey, 'On-screen British Sign Language', this.REQUESTED_BSL_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Voiceover language', this.REQUESTED_VOICEOVER_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, this.cancelText, this.CANCEL_TEST_ROW_INDEX);
      if (!sessionData.journey.standardAccommodation) {
        await verifyContainsText(this.testDetailsKey, 'Additional support during the test', this.TEST_SUPPORT_ROW_INDEX);
      }
    } else if (sessionData.journey.isInstructor && sessionData.target === Target.GB) {
      await verifyContainsText(this.testDetailsKey, 'Booking reference', this.BOOKING_REFERENCE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test type', this.TEST_TYPE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test time and date', this.TEST_TIME_DATE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test location', this.TEST_LOCATION_ROW_INDEX);
      await t.expect(Selector(this.testDetailsRow).nth(this.TEST_LANGUAGE_ROW_INDEX).visible).ok('Test Language row was not visible');
      await verifyContainsText(this.testDetailsKey, 'On-screen language', this.TEST_LANGUAGE_ROW_INDEX);
      // No BSL
      await verifyContainsText(this.testDetailsKey, 'Voiceover language', this.REQUESTED_VOICEOVER_ROW_INDEX - 1);
      await verifyContainsText(this.testDetailsKey, this.cancelText, this.CANCEL_TEST_ROW_INDEX - 1);
      if (!sessionData.journey.standardAccommodation) {
        await verifyContainsText(this.testDetailsKey, 'Additional support during the test', this.TEST_SUPPORT_ROW_INDEX - 1);
      }
    } else if (sessionData.journey.isInstructor && sessionData.target === Target.NI) {
      await verifyContainsText(this.testDetailsKey, 'Booking reference', this.BOOKING_REFERENCE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test type', this.TEST_TYPE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test time and date', this.TEST_TIME_DATE_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'Test location', this.TEST_LOCATION_ROW_INDEX);
      await verifyContainsText(this.testDetailsKey, 'On-screen language', this.TEST_LANGUAGE_ROW_INDEX);
      // No BSL/Voiceover
    }

    // field values
    if (!sessionData.journey.isInstructor) {
      await verifyExactText(this.testDetailsValue, sessionData.currentBooking.bookingRef, this.BOOKING_REFERENCE_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), this.TEST_TYPE_ROW_INDEX);

      const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
      const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
      const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
      await verifyContainsText(this.testDetailsValue, expTestTime, this.TEST_TIME_DATE_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, expTestDate, this.TEST_TIME_DATE_ROW_INDEX);

      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, this.TEST_LOCATION_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, this.TEST_LOCATION_ROW_INDEX);
      if (sessionData.currentBooking.centre.addressLine2) {
        await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, this.TEST_LOCATION_ROW_INDEX);
      }
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, this.TEST_LOCATION_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, this.TEST_LOCATION_ROW_INDEX);

      await verifyContainsText(this.testDetailsValue, Languages.get(sessionData.currentBooking.language), this.TEST_LANGUAGE_ROW_INDEX);

      // check whether BSL or Voiceover is selected - both cannot be selected
      if (sessionData.currentBooking.bsl) {
        await verifyContainsText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), this.REQUESTED_BSL_ROW_INDEX);
        await verifyContainsText(this.testDetailsValue, this.voiceoverWarningText, this.REQUESTED_VOICEOVER_ROW_INDEX);
      } else if (sessionData.currentBooking.voiceover !== Voiceover.NONE) {
        await verifyContainsText(this.testDetailsValue, this.bslWarningText, this.REQUESTED_BSL_ROW_INDEX);
        await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), this.REQUESTED_VOICEOVER_ROW_INDEX);
      } else {
        await verifyContainsText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), this.REQUESTED_BSL_ROW_INDEX);
        await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), this.REQUESTED_VOICEOVER_ROW_INDEX);
      }

      if (!sessionData.journey.standardAccommodation) {
        const testSupportNeedsArray = this.mapToSupportType(sessionData.currentBooking.testSupportNeeds, sessionData.currentBooking.translator);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        testSupportNeedsArray.forEach(async (testSupportNeed) => {
          await verifyContainsText(this.testDetailsValue, testSupportNeed, this.TEST_SUPPORT_ROW_INDEX);
        });
      }
    } else if (sessionData.journey.isInstructor && sessionData.target === Target.GB) {
      await verifyExactText(this.testDetailsValue, sessionData.currentBooking.bookingRef, this.BOOKING_REFERENCE_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), this.TEST_TYPE_ROW_INDEX);

      const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
      const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
      const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
      await verifyContainsText(this.testDetailsValue, expTestTime, this.TEST_TIME_DATE_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, expTestDate, this.TEST_TIME_DATE_ROW_INDEX);

      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, this.TEST_LOCATION_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, this.TEST_LOCATION_ROW_INDEX);
      if (sessionData.currentBooking.centre.addressLine2) {
        await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, this.TEST_LOCATION_ROW_INDEX);
      }
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, this.TEST_LOCATION_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, this.TEST_LOCATION_ROW_INDEX);

      await verifyContainsText(this.testDetailsValue, Languages.get(sessionData.currentBooking.language), this.TEST_LANGUAGE_ROW_INDEX);
      // No BSL
      await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), this.REQUESTED_VOICEOVER_ROW_INDEX - 1);
      if (!sessionData.journey.standardAccommodation) {
        const testSupportNeedsArray = this.mapToSupportType(sessionData.currentBooking.testSupportNeeds, sessionData.currentBooking.translator);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        testSupportNeedsArray.forEach(async (testSupportNeed) => {
          await verifyContainsText(this.testDetailsValue, testSupportNeed, this.TEST_SUPPORT_ROW_INDEX - 1);
        });
      }
    } else if (sessionData.journey.isInstructor && sessionData.target === Target.NI) {
      await verifyExactText(this.testDetailsValue, sessionData.currentBooking.bookingRef, this.BOOKING_REFERENCE_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), this.TEST_TYPE_ROW_INDEX);

      const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
      const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
      const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
      await verifyContainsText(this.testDetailsValue, expTestTime, this.TEST_TIME_DATE_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, expTestDate, this.TEST_TIME_DATE_ROW_INDEX);

      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, this.TEST_LOCATION_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, this.TEST_LOCATION_ROW_INDEX);
      if (sessionData.currentBooking.centre.addressLine2) {
        await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, this.TEST_LOCATION_ROW_INDEX);
      }
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, this.TEST_LOCATION_ROW_INDEX);
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, this.TEST_LOCATION_ROW_INDEX);

      await verifyContainsText(this.testDetailsValue, Languages.get(sessionData.currentBooking.language), this.TEST_LANGUAGE_ROW_INDEX);
      // No BSL/Voiceover
    }
  }

  async checkChangeActions(sessionData: SessionData, manageBookingActionType: ManageBookingActionTypes): Promise<void> {
    if (manageBookingActionType === ManageBookingActionTypes.STANDARD_BOOKING
      || manageBookingActionType === ManageBookingActionTypes.ELIGIBILITY_OVERRIDE) {
      if (sessionData.testDateLessThan3Days) { // change links should be hidden
        await t.expect(Selector(this.changeTimeLink, { timeout: 5000 }).visible).notOk('Change Test Date,Time,Location was visible');
        await t.expect(Selector(this.changeLanguageLink, { timeout: 5000 }).visible).notOk('Change Test Language was visible');
        await t.expect(Selector(this.changeBslLink, { timeout: 5000 }).visible).notOk('Change BSL was visible');
        await t.expect(Selector(this.changeVoiceoverLink, { timeout: 5000 }).visible).notOk('Change Voiceover was visible');
      } else {
        if (manageBookingActionType === ManageBookingActionTypes.ELIGIBILITY_OVERRIDE) {
          await t.expect(Selector(this.changeTimeLink, { timeout: 5000 }).visible).notOk('Change Test Date,Time,Location was visible');
        } else {
          await t.expect(Selector(this.changeTimeLink).visible).ok('Change Test Date,Time,Location was not visible');
        }
        if (sessionData.target === Target.GB && sessionData.currentBooking.testType !== TestType.ERS) {
          await t.expect(Selector(this.changeLanguageLink).visible).ok('Change Test Language was not visible');
        } else {
          await t.expect(Selector(this.changeLanguageLink, { timeout: 5000 }).visible).notOk('Change Test Language action was visible');
        }
        if (!sessionData.journey.isInstructor) {
          await t.expect(Selector(this.changeBslLink).visible).ok('Change BSL was not visible');
          // Instructor No BSL
        }
        if (!sessionData.journey.isInstructor) {
          await t.expect(Selector(this.changeVoiceoverLink).visible).ok('Change Voiceover was not visible');
        } else if (sessionData.journey.isInstructor && sessionData.target === Target.GB) {
          await t.expect(Selector(this.changeVoiceoverLink).visible).ok('Change Voiceover was not visible');
        } else if (sessionData.journey.isInstructor && sessionData.target === Target.NI) {
          // NI Instructor No Voiceover
          await t.expect(Selector(this.changeVoiceoverLink, { timeout: 5000 }).visible).notOk('Change Voiceover was visible');
        }
      }
      const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
      const today = dayjs();
      const testDate = dayjs(sessionTestTimeDate);
      if (today.isSame(testDate, 'day')) {
        await t.expect(Selector(this.cancelTestButton, { timeout: 5000 }).visible).notOk('Cancel button was visible');
      } else {
        await t.expect(Selector(this.cancelTestButton).visible).ok('Cancel button was NOT visible');
      }
    } else if (manageBookingActionType === ManageBookingActionTypes.NON_STANDARD_BOOKING
      || manageBookingActionType === ManageBookingActionTypes.BLOCKED_ONLINE) {
      // no change or cancel buttons should be visible
      await t.expect(Selector(this.changeTimeLink, { timeout: 5000 }).visible).notOk('Change Test Date,Time,Location was visible');
      await t.expect(Selector(this.changeLanguageLink, { timeout: 5000 }).visible).notOk('Change Test Language was visible');
      await t.expect(Selector(this.changeBslLink, { timeout: 5000 }).visible).notOk('Change BSL was visible');
      await t.expect(Selector(this.changeVoiceoverLink, { timeout: 5000 }).visible).notOk('Change Voiceover was visible');
      await t.expect(Selector(this.cancelTestButton, { timeout: 5000 }).visible).notOk('Cancel button was visible');
    }
  }

  mapToSupportType(supports: CRMTestSupportNeed[], foreignLanguage: string): string[] {
    if (supports === null || supports === undefined || supports.length === 0) {
      return [];
    }
    return supports.map((support) => {
      switch (support) {
        case CRMTestSupportNeed.BSLInterpreter: return 'Sign language (Interpreter)';
        case CRMTestSupportNeed.ExtraTime: return 'Extra time';
        case CRMTestSupportNeed.ExtraTimeWithBreak: return 'Extra time – pause HPT and /or breaks';
        case CRMTestSupportNeed.ForeignLanguageInterpreter: return `Foreign language interpreter: ${foreignLanguage}`;
        case CRMTestSupportNeed.HomeTest: return 'Home test';
        case CRMTestSupportNeed.LipSpeaker: return 'Lip speaker';
        case CRMTestSupportNeed.NonStandardAccommodationRequest: return 'Non-standard accommodation request';
        case CRMTestSupportNeed.OralLanguageModifier: return 'Oral language modifier';
        case CRMTestSupportNeed.OtherSigner: return 'Other signer / interpreter';
        case CRMTestSupportNeed.Reader: return 'Reader';
        case CRMTestSupportNeed.FamiliarReaderToCandidate: return 'Reader familiar to candidate';
        case CRMTestSupportNeed.Reader_Recorder: return 'Reader / recorder';
        case CRMTestSupportNeed.SeperateRoom: return 'Separate room';
        case CRMTestSupportNeed.TestInIsolation: return 'Test in isolation';
        case CRMTestSupportNeed.SpecialTestingEquipment: return 'Medication/ drink/ special testing equipment';
        default: return '';
      }
    });
  }
}
