import { BasePage } from './base-page';
import {
  capitalizeFirstLetter, click, convertDateToDisplayFormat, convertTimeToDisplayFormat, getVoiceoverOption, link, verifyContainsText, verifyExactText, verifyNotContainsText, verifyTitleContainsText,
} from '../utils/helpers';
import { SessionData } from '../data/session-data';
import {
  EvidencePathNames, Languages, SupportTypeText, TestTypeName,
} from '../data/constants';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { Target, TestType } from '../../../src/domain/enums';

export class BookingConfirmationPage extends BasePage {
  pageHeadingLocator = '.govuk-panel__title';

  bookingConfirmationMessageLocator = '.govuk-panel__body';

  bookingReferenceLocator = `${this.bookingConfirmationMessageLocator} > span:nth-of-type(2)`;

  testKeyLocator = '.govuk-summary-list__key';

  testValueLocator = '.govuk-summary-list__value';

  testLocation1 = '#centreName';

  testLocation2 = '#centreAddressLine1';

  testLocation3 = '#centreAddressLine2';

  testLocation4 = '#centreAddressCity';

  testLocation5 = '#centreAddressPostalCode';

  printPageLink = '#printTrigger';

  importantSubheading = 'h2[data-automation-id="important-subheading"]';

  centreSubheading = 'h2[data-automation-id="centre-subheading"]';

  belongingsSubheading = 'h2[data-automation-id="belongings-subheading"]';

  waitingSubheading = 'h2[data-automation-id="waiting-subheading"]';

  prepareSubheading = 'h2[data-automation-id="prepare-message"]';

  prepareSubheadingNsa = 'h2[data-automation-id="prepare-subheading"]';

  cancelSubheading = 'h2[data-automation-id="cancel-subheading"]';

  learnMoreLink = 'a[data-automation-id="learn-more-link"]';

  rescheduleLink = 'a[data-automation-id="reschedule-link"]';

  checkDetailsLink = 'a[data-automation-id="check-details-link"]';

  cancelLink = 'a[data-automation-id="cancel-link"]';

  // NSA related locators

  bookingReferenceLocatorNSAEvidence = `${this.bookingConfirmationMessageLocator} > span:nth-of-type(3)`;

  importantBannerLocator = '.govuk-notification-banner__heading';

  nsaTestDetailsHeading = 'h3[data-automation-id="test-and-support-details"]';

  nsaTestDetailsKey = `${this.nsaTestDetailsHeading} ~ table tr td:nth-of-type(1)`;

  nsaTestDetailsValue = `${this.nsaTestDetailsHeading} ~ table tr td:nth-of-type(2)`;

  whatToDoNextHeadingNsa = 'h2[data-automation-id="what-to-do-next"]';

  emailEvidenceSubheadingNsa = 'h3[data-automation-id="email-your-evidence"]';

  importantSubheadingNsa = 'h3[data-automation-id="booking-confirmation-important"]';

  importantBookingReferenceEvidenceNsa = `${this.importantSubheadingNsa} ~ p.govuk-body > strong`;

  otherWaysToSendEvidenceSubheadingNsa = 'h3[data-automation-id="other-ways-to-send-evidence"]';

  yourEvidenceSubheadingNsa = 'h3[data-automation-id="your-evidence"]';

  whenWeReceiveYourEvidenceSubheadingNsa = 'h3[data-automation-id="when-we-get-your-evidence"]';

  evidenceMaybeRequiredSubheadingNsa = 'h3[data-automation-id="when-evidence-might-be-needed"]';

  contactDetailsSubheadingNsa = 'h3[data-automation-id="contact-details"]';

  pathUrl = 'booking-confirmation';

  // Contents
  pageHeadingSA = 'Theory test booking confirmed';

  pageHeadingNSANoEvidence = 'Your theory test support request has been sent';

  pageHeadingNSAEvidence = 'Send us evidence now to complete your support request';

  nsaEvidenceRequiredText = 'Your request will not be processed until this evidence is received';

  bookingConfirmationText = 'Your booking reference is important';

  nsaImportantText = 'We are currently responding to a high number of enquiries and we will contact you as soon as possible to arrange your theory test.';

  referenceText = 'Keep it safe';

  nsaReferenceText = 'Your reference';

  testTypeText = 'Test type';

  testTimeAndDateText = 'Test time and date';

  testLocationText = 'Test location';

  testLanguageText = 'On-screen language';

  testSupportRequested = 'Support requested';

  testSupportTypesSelected = 'Support types you selected';

  preferredTime = 'Preferred time for test';

  preferredLocations = 'Preferred locations for test';

  bslText = 'On-screen British Sign Language';

  voiceoverText = 'Voiceover language';

  importantHeaderText = 'Important';

  centreHeaderText = 'Security at the test centre';

  bleongingsHeaderText = 'Personal belongings';

  waitingHeaderText = 'No waiting facilities';

  prepareHeaderText = 'Prepare for the test';

  cancelHeaderText = 'Checking, changing or cancelling this test';

  // NSA content

  keepReferenceSafe = 'Keep this reference safe';

  testSupportDetails = 'Your test and support details';

  whatToDoNow = 'What you must do now';

  emailEvidence = 'Email your evidence';

  otherWaysToSendEvidence = 'Other ways to send evidence';

  yourEvidence = 'Your evidence';

  whenWeReceiveEvidence = 'When we receive your evidence';

  evidenceMaybeRequired = 'You may need to provide evidence';

  contactUs = 'You can also contact us';

  async preparingForTheTheoryTest(): Promise<void> {
    await click(this.learnMoreLink);
  }

  async changeTheTimeOfThisTest(): Promise<void> {
    await click(this.rescheduleLink);
  }

  async cancelTheTest(): Promise<void> {
    await click(this.cancelLink);
  }

  async printPage(): Promise<void> {
    await link('print this page.');
  }

  async checkDataMatchesSession(sessionData: SessionData): Promise<void> {
    await verifyTitleContainsText(`${this.pageHeadingSA}`);
    await verifyContainsText(this.bookingConfirmationMessageLocator, this.bookingConfirmationText);
    await verifyContainsText(this.bookingConfirmationMessageLocator, this.referenceText);
    await verifyExactText(this.bookingReferenceLocator, sessionData.currentBooking.bookingRef);

    await this.checkHeadingsAppearCorrectly(sessionData);

    await verifyContainsText(this.testValueLocator, TestTypeName.get(sessionData.currentBooking.testType), 0);

    const testDateTime = new Date(sessionData.currentBooking.dateTime);
    const expTestTime = convertTimeToDisplayFormat(testDateTime);
    const expTestDate = convertDateToDisplayFormat(testDateTime);
    await verifyContainsText(this.testValueLocator, expTestTime, 1);
    await verifyContainsText(this.testValueLocator, expTestDate, 1);

    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.name, 2);
    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressLine1, 2);
    if (sessionData.currentBooking.centre.addressLine2) {
      await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressLine2, 2);
    }
    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressCity, 2);
    await verifyContainsText(this.testValueLocator, sessionData.currentBooking.centre.addressPostalCode, 2);

    await verifyContainsText(this.testValueLocator, Languages.get(sessionData.currentBooking.language), 3);

    if (sessionData.target === Target.GB) {
      if (sessionData.currentBooking.testType === TestType.CAR || sessionData.currentBooking.testType === TestType.MOTORCYCLE) {
        await verifyContainsText(this.testValueLocator, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString()), 4);
        await verifyContainsText(this.testValueLocator, getVoiceoverOption(sessionData), 5);
      } else {
        await verifyContainsText(this.testValueLocator, getVoiceoverOption(sessionData), 4);
      }
    }
  }

  async checkHeadingsAppearCorrectly(sessionData: SessionData): Promise<void> {
    await verifyContainsText(this.testKeyLocator, this.testTypeText, 0);
    await verifyContainsText(this.testKeyLocator, this.testTimeAndDateText, 1);
    await verifyContainsText(this.testKeyLocator, this.testLocationText, 2);
    await verifyContainsText(this.testKeyLocator, this.testLanguageText, 3);

    if (sessionData.target === Target.GB) {
      if (sessionData.currentBooking.testType === TestType.CAR || sessionData.currentBooking.testType === TestType.MOTORCYCLE) {
        await verifyContainsText(this.testKeyLocator, this.bslText, 4);
        await verifyContainsText(this.testKeyLocator, this.voiceoverText, 5);
      } else {
        await verifyContainsText(this.testKeyLocator, this.voiceoverText, 4);
      }
    }

    await verifyContainsText(this.importantSubheading, this.importantHeaderText);
    await verifyContainsText(this.centreSubheading, this.centreHeaderText);
    await verifyContainsText(this.belongingsSubheading, this.bleongingsHeaderText);
    await verifyContainsText(this.waitingSubheading, this.waitingHeaderText);
    await verifyContainsText(this.prepareSubheading, this.prepareHeaderText);
    await verifyContainsText(this.cancelSubheading, this.cancelHeaderText);
  }

  async checkDataMatchesSessionNSA(sessionData: SessionData, path: EvidencePathNames): Promise<void> {
    await this.checkHeadingsAppearCorrectlyNSA(path);

    let confirmationPageTitle = '';
    let bookingRefLocator = '';
    if (path === EvidencePathNames.EVIDENCE_REQUIRED) {
      confirmationPageTitle = this.pageHeadingNSAEvidence;
      bookingRefLocator = this.bookingReferenceLocatorNSAEvidence;
    } else if (path === EvidencePathNames.EVIDENCE_NOT_REQUIRED || path === EvidencePathNames.EVIDENCE_MAY_BE_REQUIRED) {
      confirmationPageTitle = this.pageHeadingNSANoEvidence;
      bookingRefLocator = this.bookingReferenceLocator;
    }
    await verifyTitleContainsText(confirmationPageTitle);
    await verifyContainsText(this.pageHeadingLocator, confirmationPageTitle);
    await verifyExactText(bookingRefLocator, sessionData.currentBooking.bookingRef);

    await verifyContainsText(this.nsaTestDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), 0);
    await verifyContainsText(this.nsaTestDetailsValue, Languages.get(sessionData.currentBooking.language), 1);
    await verifyContainsText(this.nsaTestDetailsValue, 'Yes', 2);
    const supportTypes = sessionData.currentBooking.selectSupportType;
    for (let index = 0; index < supportTypes.length; index++) {
      const supportTypeAbbrevText = SupportTypeText.get(supportTypes[index]);
      // eslint-disable-next-line no-await-in-loop
      await verifyContainsText(this.nsaTestDetailsValue, supportTypeAbbrevText, 3);
    }
    await verifyContainsText(this.nsaTestDetailsValue, sessionData.currentBooking.preferredDay, 4);
    await verifyContainsText(this.nsaTestDetailsValue, sessionData.currentBooking.preferredLocation, 5);

    if (path === EvidencePathNames.EVIDENCE_REQUIRED) {
      await verifyExactText(this.importantBookingReferenceEvidenceNsa, sessionData.currentBooking.bookingRef);
    }
  }

  async checkHeadingsAppearCorrectlyNSA(path: EvidencePathNames): Promise<void> {
    await verifyContainsText(this.nsaTestDetailsKey, this.testTypeText, 0);
    await verifyContainsText(this.nsaTestDetailsKey, this.testLanguageText, 1);
    await verifyContainsText(this.nsaTestDetailsKey, this.testSupportRequested, 2);
    await verifyContainsText(this.nsaTestDetailsKey, this.testSupportTypesSelected, 3);
    await verifyContainsText(this.nsaTestDetailsKey, this.preferredTime, 4);
    await verifyContainsText(this.nsaTestDetailsKey, this.preferredLocations, 5);

    await verifyContainsText(this.bookingConfirmationMessageLocator, this.keepReferenceSafe);
    if (path === EvidencePathNames.EVIDENCE_REQUIRED) {
      await verifyContainsText(this.bookingConfirmationMessageLocator, this.nsaEvidenceRequiredText);
      await verifyContainsText(this.nsaTestDetailsHeading, this.testSupportDetails);
      await verifyContainsText(this.whatToDoNextHeadingNsa, this.whatToDoNow);
      await verifyContainsText(this.emailEvidenceSubheadingNsa, this.emailEvidence);
      await verifyContainsText(this.importantSubheadingNsa, this.importantHeaderText);
      await verifyContainsText(this.otherWaysToSendEvidenceSubheadingNsa, this.otherWaysToSendEvidence);
      await verifyContainsText(this.yourEvidenceSubheadingNsa, this.yourEvidence);
      await verifyContainsText(this.whenWeReceiveYourEvidenceSubheadingNsa, this.whenWeReceiveEvidence);
      await verifyContainsText(this.contactDetailsSubheadingNsa, this.contactUs);
    } else if (path === EvidencePathNames.EVIDENCE_NOT_REQUIRED) {
      await verifyNotContainsText(this.bookingConfirmationMessageLocator, this.nsaEvidenceRequiredText);
      await verifyContainsText(this.contactDetailsSubheadingNsa, this.contactUs);
    } else if (path === EvidencePathNames.EVIDENCE_MAY_BE_REQUIRED) {
      await verifyNotContainsText(this.bookingConfirmationMessageLocator, this.nsaEvidenceRequiredText);
      await verifyContainsText(this.evidenceMaybeRequiredSubheadingNsa, this.evidenceMaybeRequired);
      await verifyContainsText(this.contactDetailsSubheadingNsa, this.contactUs);
    }
  }
}
