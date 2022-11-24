import { Target } from '../../../src/domain/enums';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { Languages, TestTypeName, MAX_TIMEOUT } from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  verifyExactText, verifyContainsText, link, capitalizeFirstLetter, convertDateToDisplayFormat, convertTimeToDisplayFormat, verifyTitleContainsText, getVoiceoverOption,
} from '../utils/helpers';
import { BasePage } from './base-page';

export class ChangeConfirmedPage extends BasePage {
  pageHeadingLocator = '.govuk-panel__title';

  bookingConfirmationMessageLocator = '.govuk-panel__body';

  bookingReferenceLocator = `${this.bookingConfirmationMessageLocator} > span`;

  testDetailsKey = 'dt.govuk-summary-list__key';

  testDetailsValue = 'dd.govuk-summary-list__value';

  viewAllBookingsButton = '#view-all-bookings';

  makeAnotherChangeButton = '#make-another-change';

  importantSubheading = 'h2[data-automation-id="important-subheading"]';

  centreSubheading = 'h2[data-automation-id="centre-subheading"]';

  belongingsSubheading = 'h2[data-automation-id="belongings-subheading"]';

  waitingSubheading = 'h2[data-automation-id="waiting-subheading"]';

  prepareSubheading = 'h2[data-automation-id="prepare-message"]';

  cancelSubheading = 'h2[data-automation-id="cancel-subheading"]';

  pathUrl = 'check-change';

  // Contents
  pageHeading = 'Theory test updated';

  bookingConfirmationText = 'Your booking reference is important';

  referenceText = 'Keep it safe';

  testTypeText = 'Test type';

  testTimeAndDateText = 'Test time and date';

  testLocationText = 'Test location';

  testLanguageText = 'On-screen language';

  bslText = 'On-screen British Sign Language';

  voiceoverText = 'Voiceover language';

  importantHeaderText = 'Important';

  centreHeaderText = 'Security at the test centre';

  bleongingsHeaderText = 'Personal belongings';

  waitingHeaderText = 'No waiting facilities';

  prepareHeaderText = 'Prepare for the test';

  cancelHeaderText = 'Checking, changing or cancelling this test';

  async checkBookingUpdatedConfirmationPage(sessionData: SessionData): Promise<void> {
    await verifyTitleContainsText(this.pageHeading, MAX_TIMEOUT);
    await verifyContainsText(this.pageHeadingLocator, this.pageHeading, 0, MAX_TIMEOUT);
    await verifyContainsText(this.bookingConfirmationMessageLocator, this.bookingConfirmationText);
    await verifyContainsText(this.bookingConfirmationMessageLocator, this.referenceText);
    await verifyExactText(this.bookingReferenceLocator, sessionData.currentBooking.bookingRef);

    await this.checkHeadingsAppearCorrectly(sessionData);

    await verifyContainsText(this.testDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), 0);

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

    await verifyContainsText(this.testDetailsValue, Languages.get(sessionData.currentBooking.language), 3);

    if (!sessionData.journey.isInstructor) {
      await verifyContainsText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), 4);
      await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), 5);
    } else if (sessionData.journey.isInstructor && sessionData.target === Target.GB) {
      await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), 4);
    }
  }

  async checkHeadingsAppearCorrectly(sessionData: SessionData): Promise<void> {
    await verifyContainsText(this.testDetailsKey, this.testTypeText, 0);
    await verifyContainsText(this.testDetailsKey, this.testTimeAndDateText, 1);
    await verifyContainsText(this.testDetailsKey, this.testLocationText, 2);
    await verifyContainsText(this.testDetailsKey, this.testLanguageText, 3);
    if (!sessionData.journey.isInstructor) {
      await verifyContainsText(this.testDetailsKey, this.bslText, 4);
      await verifyContainsText(this.testDetailsKey, this.voiceoverText, 5);
    } else if (sessionData.journey.isInstructor && sessionData.target === Target.GB) {
      await verifyContainsText(this.testDetailsKey, this.voiceoverText, 4);
    }
    await verifyContainsText(this.importantSubheading, this.importantHeaderText);
    await verifyContainsText(this.centreSubheading, this.centreHeaderText);
    await verifyContainsText(this.belongingsSubheading, this.bleongingsHeaderText);
    await verifyContainsText(this.waitingSubheading, this.waitingHeaderText);
    await verifyContainsText(this.prepareSubheading, this.prepareHeaderText);
    await verifyContainsText(this.cancelSubheading, this.cancelHeaderText);
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
