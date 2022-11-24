/* eslint-disable import/no-cycle */
import { t } from 'testcafe';
import { BasePage } from './base-page';
import {
  capitalizeFirstLetter, click, convertDateToDisplayFormat, convertTimeToDisplayFormat, getText, getVoiceoverOption, verifyContainsText, verifyExactText, verifyIsNotVisible, verifyIsVisible,
} from '../utils/helpers';
import { ContactDetailsPage } from './contact-details-page';
import { LanguagePage } from './language-page';
import { TestTypePage } from './test-type-page';
import { WhatDoYouWantToChangePage } from './what-do-you-want-to-change-page';
import { SessionData } from '../data/session-data';
import { Languages, TestTypeName, TestTypeToPrice } from '../data/constants';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { BslPage } from './bsl-page';
import { VoiceoverPage } from './voiceover-page';
import { PaymentsPage } from './payments-page';
import { ChooseSupportPage } from './choose-support-page';
import { Target, TestType, Voiceover } from '../../../src/domain/enums';

export class CheckYourDetailsPage extends BasePage {
  // locators
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  backLink = 'a[data-automation-id="back"]';

  personalDetailsHeadingLocator = 'h2[data-automation-id="personal-details-heading"]';

  personalDetailsLocator = '.govuk-summary-list:nth-of-type(1)';

  personalDetailsKey = `${this.personalDetailsLocator} dt.govuk-summary-list__key`;

  personalDetailsValue = `${this.personalDetailsLocator} dd.govuk-summary-list__value`;

  changeEmailLink = 'a[data-automation-id="email"]';

  testDetailsHeadingLocator = 'h2[data-automation-id="test-details-heading"]';

  testDetailsLocator = '.govuk-summary-list:nth-of-type(2)';

  testDetailsKey = `${this.testDetailsLocator} dt.govuk-summary-list__key`;

  testDetailsValue = `${this.testDetailsLocator} dd.govuk-summary-list__value`;

  changeTestTypeLink = 'a[data-automation-id="test-type"]';

  changeTestLanguageLink = 'a[data-automation-id="test-language"]';

  changeTestTimeDateLocationLink = 'a[data-automation-id="time"]';

  changeSupportRequestedLink = 'a[data-automation-id="support-requested"]';

  changeBslLink = 'a[data-automation-id="bsl"]';

  changeVoiceoverLink = 'a[data-automation-id="voiceover"]';

  paymentAlertMessageLocator = '.govuk-warning-text__text';

  continueButton = 'button[data-automation-id="continue"]';

  // content
  pageHeading = 'Check your details before paying';

  pageHeadingNiInstructor = 'Check your details';

  paymentAlertMessage = 'Complete the payment process within 30 minutes. If you do not, this booking will be cancelled but you may still be charged. You will have to start your booking again and the test slot you were trying to book may no longer be available.';

  voiceoverWarningText = 'To add voiceover to this test you must first remove sign language';

  bslWarningText = 'To add sign language to this test you must first remove voiceover';

  pathUrl = 'check-your-answers';

  async continueBooking(): Promise<PaymentsPage> {
    await click(this.continueButton);
    return new PaymentsPage();
  }

  async changeEmail(): Promise<ContactDetailsPage> {
    await click(this.changeEmailLink);
    return new ContactDetailsPage();
  }

  async changeTestLanguage(): Promise<LanguagePage> {
    await click(this.changeTestLanguageLink);
    return new LanguagePage();
  }

  async changeTestType(): Promise<TestTypePage> {
    await click(this.changeTestTypeLink);
    return new TestTypePage();
  }

  async changeTestTimeDateLocation(): Promise<WhatDoYouWantToChangePage> {
    await click(this.changeTestTimeDateLocationLink);
    return new WhatDoYouWantToChangePage();
  }

  async changeSupportRequested(): Promise<ChooseSupportPage> {
    await click(this.changeSupportRequestedLink);
    return new ChooseSupportPage();
  }

  async changeBsl(): Promise<BslPage> {
    await click(this.changeBslLink);
    return new BslPage();
  }

  async changeVoiceover(): Promise<VoiceoverPage> {
    await click(this.changeVoiceoverLink);
    return new VoiceoverPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async checkDataMatchesSession(sessionData: SessionData): Promise<void> {
    await verifyExactText(this.personalDetailsValue, `${sessionData.candidate.firstnames} ${sessionData.candidate.surname}`, 0);
    const sessionDobDate = new Date(sessionData.candidate.dateOfBirth);
    const expDobDate = convertDateToDisplayFormat(sessionDobDate);
    await verifyExactText(this.personalDetailsValue, expDobDate, 1);
    await verifyExactText(this.personalDetailsValue, sessionData.candidate.licenceNumber, 2);
    await verifyExactText(this.personalDetailsValue, sessionData.candidate.email, 3);
    let OFFSET_INDEX = 0;
    await verifyContainsText(this.testDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), OFFSET_INDEX);
    OFFSET_INDEX++;
    if (sessionData.target === Target.GB || (sessionData.target === Target.NI && !sessionData.journey.isInstructor)) {
      if (sessionData.isCompensationBooking) {
        const priceDetailsText = (await getText(this.testDetailsValue, OFFSET_INDEX)).toUpperCase();
        await t.expect(priceDetailsText).contains(`${TestTypeToPrice.get(sessionData.currentBooking.testType)}`);
        await t.expect(priceDetailsText).contains('ALREADY PAID');
      } else {
        await verifyExactText(this.testDetailsValue, TestTypeToPrice.get(sessionData.currentBooking.testType), OFFSET_INDEX);
      }
      OFFSET_INDEX++;
    }
    const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
    const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
    await verifyContainsText(this.testDetailsValue, expTestTime, OFFSET_INDEX);
    const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
    await verifyContainsText(this.testDetailsValue, expTestDate, OFFSET_INDEX);
    OFFSET_INDEX++;
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, OFFSET_INDEX);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, OFFSET_INDEX);
    if (sessionData.currentBooking.centre.addressLine2) {
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, OFFSET_INDEX);
    }
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, OFFSET_INDEX);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, OFFSET_INDEX);
    OFFSET_INDEX++;
    await verifyContainsText(this.testDetailsValue, Languages.get(sessionData.currentBooking.language), OFFSET_INDEX);
    OFFSET_INDEX++;
    if (sessionData.target === Target.GB || (sessionData.target === Target.NI && !sessionData.journey.isInstructor)) {
      await verifyContainsText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.journey.support).toString()), OFFSET_INDEX);
      OFFSET_INDEX++;
      if (sessionData.currentBooking.testType === TestType.CAR || sessionData.currentBooking.testType === TestType.MOTORCYCLE) {
        // check whether BSL or Voiceover is selected - both cannot be selected
        if (sessionData.currentBooking.bsl) {
          await verifyContainsText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), OFFSET_INDEX);
          OFFSET_INDEX++;
          await verifyContainsText(this.testDetailsValue, this.voiceoverWarningText, OFFSET_INDEX);
        } else if (sessionData.currentBooking.voiceover !== Voiceover.NONE) {
          await verifyContainsText(this.testDetailsValue, this.bslWarningText, OFFSET_INDEX);
          OFFSET_INDEX++;
          await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), OFFSET_INDEX);
        } else {
          await verifyContainsText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), OFFSET_INDEX);
          OFFSET_INDEX++;
          await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), OFFSET_INDEX);
        }
      } else {
        await verifyContainsText(this.testDetailsValue, getVoiceoverOption(sessionData), OFFSET_INDEX);
      }
    }
    if (sessionData.journey.isInstructor) {
      await verifyIsNotVisible(this.changeTestTypeLink);
    } else {
      await verifyIsVisible(this.changeTestTypeLink);
    }
    if (sessionData.isCompensationBooking || (sessionData.journey.isInstructor && sessionData.target === Target.NI)) {
      await verifyIsNotVisible(this.paymentAlertMessageLocator);
    } else {
      await verifyContainsText(this.paymentAlertMessageLocator, this.paymentAlertMessage);
    }
  }
}
