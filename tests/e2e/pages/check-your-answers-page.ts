/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import {
  capitalizeFirstLetter, click, convertDateToDisplayFormat, convertTimeToDisplayFormat, getVoiceoverOption, verifyContainsText, verifyExactText,
} from '../utils/helpers';
import { ContactDetailsPage } from './contact-details-page';
import { LanguagePage } from './language-page';
import { TestTypePage } from './test-type-page';
import { WhatDoYouWantToChangePage } from './what-do-you-want-to-change-page';
import { SessionData } from '../data/session-data';
import { LANGUAGES } from '../data/constants';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { AdditionalSupportBslPage } from './additional-support-bsl-page';
import { AdditionalSupportVoiceoverPage } from './additional-support-voiceover-page';
import { PaymentsPage } from './payments-page';

export class CheckYourAnswersPage extends BasePage {
  pageTitleLocator = '.govuk-heading-xl';

  pageTitle = 'Check your answers';

  pageHeading = 'Check your answers';

  backLink = '.govuk-back-link';

  headingLocator = 'h2.govuk-heading-m';

  personalDetailsLocator = '.govuk-summary-list:nth-of-type(1)';

  personalDetailsKey = `${this.personalDetailsLocator} dt.govuk-summary-list__key`;

  personalDetailsValue = `${this.personalDetailsLocator} dd.govuk-summary-list__value`;

  changeEmailLink = `${this.personalDetailsLocator} dd.govuk-summary-list__actions a[href*="contact-details"]`;

  testDetailsLocator = '.govuk-summary-list:nth-of-type(2)';

  testDetailsKey = `${this.testDetailsLocator} dt.govuk-summary-list__key`;

  testDetailsValue = `${this.testDetailsLocator} dd.govuk-summary-list__value`;

  changeTestTypeLink = `${this.testDetailsLocator} dd.govuk-summary-list__actions a[href*="test-type"]`;

  changeTestLanguageLink = `${this.testDetailsLocator} dd.govuk-summary-list__actions a[href*="test-language"]`;

  changeTestTimeDateLocationLink = `${this.testDetailsLocator} dd.govuk-summary-list__actions a[href*="change-location-time"]`;

  changeBslLink = `${this.testDetailsLocator} dd.govuk-summary-list__actions a[href*="bsl"]`;

  changeVoiceoverLink = `${this.testDetailsLocator} dd.govuk-summary-list__actions a[href*="change-voiceover"]`;

  continueButton = '.govuk-button';

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

  async changeBsl(): Promise<AdditionalSupportBslPage> {
    await click(this.changeBslLink);
    return new AdditionalSupportBslPage();
  }

  async changeVoiceover(): Promise<AdditionalSupportVoiceoverPage> {
    await click(this.changeVoiceoverLink);
    return new AdditionalSupportVoiceoverPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async checkDataMatchesSession(sessionData: SessionData) {
    await verifyExactText(this.personalDetailsValue, `${sessionData.candidate.firstnames} ${sessionData.candidate.surname}`, 0);
    const sessionDobDate = new Date(sessionData.candidate.dateOfBirth);
    const expDobDate = convertDateToDisplayFormat(sessionDobDate);
    await verifyExactText(this.personalDetailsValue, expDobDate, 1);
    await verifyExactText(this.personalDetailsValue, sessionData.candidate.licenceNumber, 2);
    await verifyExactText(this.personalDetailsValue, sessionData.candidate.email, 3);

    await verifyExactText(this.testDetailsValue, capitalizeFirstLetter(sessionData.currentBooking.testType), 0);
    await verifyExactText(this.testDetailsValue, '£23', 1); // hard coded for now
    const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
    const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
    await verifyContainsText(this.testDetailsValue, expTestTime, 2);

    const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
    await verifyContainsText(this.testDetailsValue, expTestDate, 2);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.name, 3);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine1, 3);
    if (sessionData.currentBooking.centre.addressLine2) {
      await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressLine2, 3);
    }
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressCity, 3);
    await verifyContainsText(this.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, 3);

    await verifyExactText(this.testDetailsValue, LANGUAGES.get(sessionData.currentBooking.language), 4);
    await verifyExactText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.journey.support).toString()), 5);
    await verifyExactText(this.testDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), 6);
    await verifyExactText(this.testDetailsValue, getVoiceoverOption(sessionData), 7);
  }
}
