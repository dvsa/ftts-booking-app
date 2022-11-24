import { BasePage } from './base-page';
import {
  capitalizeFirstLetter,
  click, convertDateToDisplayFormat, convertTimeToDisplayFormat, getVoiceoverOption, verifyContainsText, verifyExactText,
} from '../utils/helpers';
import { SessionData } from '../data/session-data';
import { Languages } from '../data/constants';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';

export class CheckChangePage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  testLocator = '.govuk-table__header';

  testDetailsLocator = '.govuk-summary-list';

  testDetailsRow = `${this.testDetailsLocator} .govuk-summary-list__row`;

  testDetailsKey = `${this.testDetailsLocator} dt.govuk-summary-list__key`;

  testDetailsValue = `${this.testDetailsLocator} dd.govuk-summary-list__value`;

  pathUrl = 'check-change';

  backLink = '.govuk-back-link';

  cancelChangeButtonLocator = '#clear';

  confirmChangeButtonLocator = '#continueButton';

  // Contents
  pageHeading = 'Confirm change to theory test';

  testTimeAndDateText = 'Test time and date';

  testLocationText = 'Test location';

  testLanguageText = 'Test language';

  testVoiceoverText = 'Voiceover language';

  testBslText = 'On-screen British Sign Language';

  async confirmChange(): Promise<void> {
    await click(this.confirmChangeButtonLocator);
  }

  async cancelChange(): Promise<void> {
    await click(this.cancelChangeButtonLocator);
  }

  async checkUpdatedTestDateTimeLocation(sessionData: SessionData): Promise<void> {
    await verifyExactText(this.testDetailsKey, this.testTimeAndDateText, 0);
    await verifyExactText(this.testDetailsKey, this.testLocationText, 1);

    const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
    const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
    await verifyContainsText(this.testDetailsValue, expTestTime, 0);

    const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
    await verifyContainsText(this.testDetailsValue, expTestDate, 0);

    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, 1);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, 1);
    if (sessionData.currentBooking.centre.addressLine2) {
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, 1);
    }
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, 1);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, 1);
  }

  async checkUpdatedLanguage(sessionData: SessionData): Promise<void> {
    await verifyExactText(this.testDetailsKey, this.testLanguageText, 0);
    await verifyExactText(this.testDetailsValue, Languages.get(sessionData.currentBooking.language), 0);
  }

  async checkUpdatedVoiceover(sessionData: SessionData): Promise<void> {
    await verifyContainsText(this.testDetailsKey, this.testVoiceoverText, 0);
    await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), 0);
  }

  async checkUpdatedBsl(sessionData: SessionData): Promise<void> {
    await verifyContainsText(this.testDetailsKey, this.testBslText, 0);
    await verifyContainsText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), 0);
  }
}
