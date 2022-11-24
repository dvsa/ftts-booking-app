import { t } from 'testcafe';
import {
  click, getText, verifyTitleContainsText, setAcceptCookies,
} from './helpers';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { CandidateDetailsPage } from '../pages/candidate-details-page';
import { TestTypePage } from '../pages/test-type-page';
import { LanguagePage } from '../pages/language-page';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { SessionData } from '../data/session-data';
import { SupportType, Target } from '../../../src/domain/enums';
import { EvidencePathNames, Languages, MAX_TIMEOUT } from '../data/constants';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { CustomSupportPage } from '../pages/custom-support-page';
import { NsaVoiceoverPage } from '../pages/nsa-voiceover-page';
import { StayingNSAPage } from '../pages/staying-nsa-page';
import { LeavingNsaPage } from '../pages/leaving-nsa-page';
import { NsaVoicemailPage } from '../pages/nsa-voicemail-page';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { NsaTelephoneContactPage } from '../pages/nsa-telephone-contact-page';
import { CheckYourDetailsNsaPage } from '../pages/check-your-details-nsa-page';
import { PreferredDayNSAPage } from '../pages/preferred-day-nsa-page';
import { PreferredLocationNSAPage } from '../pages/preferred-location-nsa-page';
import { TranslatorPage } from '../pages/translator-page';
import { ConfirmSupportPage } from '../pages/confirm-support-page';
import { SupportAlertPage } from '../pages/support-alert-page';
import { determineEvidenceRoute } from './evidence-helper';

export class NavigationHelperNSA {
  sessionData: SessionData;

  chooseSupportPage = new ChooseSupportPage();

  supportAlertPage = new SupportAlertPage();

  languagePage = new LanguagePage();

  selectSupportTypePage = new SelectSupportTypePage();

  voiceoverPage = new NsaVoiceoverPage();

  translatorPage = new TranslatorPage();

  customSupportPage = new CustomSupportPage();

  stayingNsaPage = new StayingNSAPage();

  leavingNsaPage = new LeavingNsaPage();

  confirmSupportPage = new ConfirmSupportPage();

  preferredDayNSAPage = new PreferredDayNSAPage();

  preferredLocationNSAPage = new PreferredLocationNSAPage();

  contactDetailsPage = new ContactDetailsPage();

  telephoneContactPage = new NsaTelephoneContactPage();

  voicemailConsentPage = new NsaVoicemailPage();

  checkYourDetailsPage = new CheckYourDetailsNsaPage();

  bookingConfirmationPage = new BookingConfirmationPage();

  path: EvidencePathNames;

  constructor(sessionData: SessionData) {
    this.sessionData = sessionData;
  }

  private isStandardAccommodationsBooking(): boolean {
    const supportTypes = this.sessionData.currentBooking.selectSupportType;

    if (supportTypes.includes(SupportType.BSL_INTERPRETER)
    || supportTypes.includes(SupportType.EXTRA_TIME)
    || supportTypes.includes(SupportType.READING_SUPPORT)
    || supportTypes.includes(SupportType.TRANSLATOR)) {
      return false;
    } if (supportTypes.includes(SupportType.OTHER) && this.sessionData.meaningfulSupportRequest === true) {
      return false;
    } if (supportTypes.includes(SupportType.OTHER) && this.sessionData.meaningfulSupportRequest === false && ((supportTypes.includes(SupportType.ON_SCREEN_BSL) || (supportTypes.includes(SupportType.VOICEOVER))))) {
      return false;
    } if (supportTypes.includes(SupportType.ON_SCREEN_BSL)) {
      return true;
    } if (supportTypes.includes(SupportType.VOICEOVER)) {
      return true;
    }
    return true;
  }

  async navigateToChooseSupportPage(): Promise<ChooseSupportPage> {
    await setAcceptCookies();
    await t.navigateTo(`${process.env.BOOKING_APP_URL}?target=${this.sessionData.target}`);
    return this.chooseSupportPage;
  }

  async navigateToCandidateDetailsPage(): Promise<CandidateDetailsPage> {
    await this.navigateToChooseSupportPage();

    // always set to yes for non-standard accommodation journeys
    if (!this.sessionData.journey.support) {
      throw new Error('Please use NavigationHelper for Standard Accommodation journeys!');
    }
    await verifyTitleContainsText(`${this.chooseSupportPage.pageHeading}`);
    await this.chooseSupportPage.selectSupportRequired(true);

    await verifyTitleContainsText(`${this.supportAlertPage.pageHeading}`);
    await this.supportAlertPage.continueAndGetSupport();
    return new CandidateDetailsPage();
  }

  async navigateToTestTypePage(): Promise<TestTypePage> {
    const candidateDetailsPage = await this.navigateToCandidateDetailsPage();
    await verifyTitleContainsText(`${candidateDetailsPage.pageHeadingSupport}`);
    await candidateDetailsPage.enterCandidateDetailsAndSubmit(this.sessionData.candidate);
    return new TestTypePage();
  }

  async navigateToLanguagePage(): Promise<void> {
    if (this.sessionData.changeSupport) {
      const testTypePage = new TestTypePage();
      await verifyTitleContainsText(`${testTypePage.pageHeadingNSA}`);
      if (this.sessionData.isCompensationBooking) {
        await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
      }
      await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
    }
    const testTypePage = await this.navigateToTestTypePage();
    await verifyTitleContainsText(`${testTypePage.pageHeadingNSA}`);
    if (this.sessionData.isCompensationBooking) {
      await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
    }
    await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
  }

  async navigateToSelectSupportTypePage(): Promise<void> {
    if (!this.sessionData.changeSupportTypes) {
      if (this.sessionData.target === Target.GB) {
        if (this.sessionData.journey.inEditMode) {
          await verifyTitleContainsText(`${this.languagePage.pageHeading}`);
          await this.languagePage.selectTestLanguage(Languages.get(this.sessionData.currentBooking.language));
        } else {
          await this.navigateToLanguagePage();
          await verifyTitleContainsText(`${this.languagePage.pageHeading}`);
          await this.languagePage.selectTestLanguage(Languages.get(this.sessionData.currentBooking.language));
        }
      } else if (this.sessionData.target === Target.NI && !this.sessionData.journey.inEditMode) {
        const testTypePage = await this.navigateToTestTypePage();
        await verifyTitleContainsText(`${testTypePage.pageHeadingNSA}`);
        if (this.sessionData.isCompensationBooking) {
          await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
        }
        await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
      }
    }
    await this.selectSupportTypePage.selectSupportTypes(this.sessionData.currentBooking.selectSupportType);
    this.path = determineEvidenceRoute(this.sessionData.currentBooking.selectSupportType, false);
  }

  async navigateToVoiceoverPage(): Promise<void> {
    await this.navigateToSelectSupportTypePage();
    await verifyTitleContainsText(`${this.voiceoverPage.pageHeading}`);
    await this.voiceoverPage.selectVoiceoverRequired(this.sessionData.currentBooking.voiceover);
  }

  async navigateToTranslatorDetailsPage(): Promise<void> {
    const supportTypes = this.sessionData.currentBooking.selectSupportType;
    if (supportTypes.includes(SupportType.VOICEOVER) && supportTypes.includes(SupportType.OTHER)) {
      await this.navigateToVoiceoverPage();

      await verifyTitleContainsText(`${this.translatorPage.pageHeading}`);
      await this.translatorPage.enterTranslatorDetails(this.sessionData.currentBooking.translator);

      await verifyTitleContainsText(`${this.customSupportPage.pageHeading}`);
      await this.customSupportPage.enterSupportInformation(this.sessionData.currentBooking.customSupport);
    } else if (supportTypes.includes(SupportType.OTHER)) {
      await this.navigateToSelectSupportTypePage();

      await verifyTitleContainsText(`${this.translatorPage.pageHeading}`);
      await this.translatorPage.enterTranslatorDetails(this.sessionData.currentBooking.translator);

      await verifyTitleContainsText(`${this.customSupportPage.pageHeading}`);
      await this.customSupportPage.enterSupportInformation(this.sessionData.currentBooking.customSupport);
    }
  }

  async navigateToCustomSupportPage(): Promise<void> {
    const supportTypes = this.sessionData.currentBooking.selectSupportType;
    if (this.sessionData.target === Target.NI && supportTypes.includes(SupportType.TRANSLATOR)) {
      await this.navigateToTranslatorDetailsPage();
    } else if (supportTypes.includes(SupportType.VOICEOVER) && supportTypes.includes(SupportType.OTHER)) {
      await this.navigateToVoiceoverPage();
      await verifyTitleContainsText(`${this.customSupportPage.pageHeading}`);
      await this.customSupportPage.enterSupportInformation(this.sessionData.currentBooking.customSupport);
    } else if (supportTypes.includes(SupportType.OTHER)) {
      await this.navigateToSelectSupportTypePage();
      await verifyTitleContainsText(`${this.customSupportPage.pageHeading}`);
      if (this.sessionData.skipSupportRequest) {
        await click(this.customSupportPage.skipButton);
      } else {
        await this.customSupportPage.enterSupportInformation(this.sessionData.currentBooking.customSupport);
      }
    } else if (supportTypes.includes(SupportType.VOICEOVER)) {
      await this.navigateToVoiceoverPage();
    } else {
      await this.navigateToSelectSupportTypePage();
    }
  }

  async navigateToConfirmSupportPage(): Promise<void> {
    await this.navigateToCustomSupportPage();
    if (this.isStandardAccommodationsBooking() && this.sessionData.meaningfulSupportRequest === false && this.sessionData.journey.confirmingSupport === true && this.sessionData.currentBooking.customSupport === 'Clicked by mistake') {
      await verifyTitleContainsText(`${this.confirmSupportPage.pageHeading}`);
      await this.confirmSupportPage.tellUsWhatSupportRequired();
    } else if (this.isStandardAccommodationsBooking() && this.sessionData.meaningfulSupportRequest === false && this.sessionData.journey.confirmingSupport === true) {
      await verifyTitleContainsText(`${this.confirmSupportPage.pageHeading}`);
      await this.confirmSupportPage.continueNsaWithoutTellingUsWhatSupport();
    } else if (this.isStandardAccommodationsBooking() && this.sessionData.meaningfulSupportRequest === false && this.sessionData.journey.confirmingSupport === false) {
      await verifyTitleContainsText(`${this.confirmSupportPage.pageHeading}`);
      await this.confirmSupportPage.continueBookingWithoutSupport();
    }
  }

  async navigateToStayingOrLeavingNsaPage(): Promise<void> {
    await this.navigateToConfirmSupportPage();
    let stayingNSAPageHeading = '';
    if (this.path === EvidencePathNames.EVIDENCE_REQUIRED) {
      stayingNSAPageHeading = this.stayingNsaPage.pageHeadingEvidence;
    } else if (this.path === EvidencePathNames.EVIDENCE_NOT_REQUIRED || this.path === EvidencePathNames.EVIDENCE_MAY_BE_REQUIRED) {
      stayingNSAPageHeading = this.stayingNsaPage.pageHeadingNoEvidence;
    }
    if (this.sessionData.journey.confirmingSupport === true) {
      await verifyTitleContainsText(stayingNSAPageHeading);
      await this.stayingNsaPage.continue();
    } else if (this.sessionData.meaningfulSupportRequest === false && this.sessionData.journey.confirmingSupport === false) {
      await verifyTitleContainsText(`${this.leavingNsaPage.pageHeading}`);
      await this.leavingNsaPage.continueBooking();

      await verifyTitleContainsText(`${this.contactDetailsPage.pageHeading}`);
      this.sessionData.journey.support = false; // set to false as we are now going into the standard accomm journey
    } else if (this.isStandardAccommodationsBooking() && !this.sessionData.journey.standardAccommodation) {
      await verifyTitleContainsText(`${this.leavingNsaPage.pageHeading}`);
      await this.leavingNsaPage.talkToSupport();

      await verifyTitleContainsText(stayingNSAPageHeading);
      await this.stayingNsaPage.continue();
    } else if (this.isStandardAccommodationsBooking() && this.sessionData.journey.standardAccommodation) {
      await verifyTitleContainsText(`${this.leavingNsaPage.pageHeading}`);
      this.sessionData.journey.support = false; // set to false as we are now going into the standard accomm journey
      await this.leavingNsaPage.continueBooking();
    } else {
      await verifyTitleContainsText(stayingNSAPageHeading);
      await this.stayingNsaPage.continue();
    }
  }

  async navigateToPeferredDayPage(): Promise<void> {
    await this.navigateToStayingOrLeavingNsaPage();
    await verifyTitleContainsText(`${this.preferredDayNSAPage.pageHeading}`);
    await this.preferredDayNSAPage.selectPreferredDayOption(this.sessionData.currentBooking.preferredDayOption);
    await this.preferredDayNSAPage.enterPreferredDayInformation(this.sessionData.currentBooking.preferredDay);
  }

  async navigateToPeferredLocationsPage(): Promise<void> {
    await this.navigateToPeferredDayPage();
    await verifyTitleContainsText(`${this.preferredLocationNSAPage.pageHeading}`);
    await this.preferredLocationNSAPage.selectPreferredLocationOption(this.sessionData.currentBooking.preferredLocationOption);
    await this.preferredLocationNSAPage.enterPreferredLocationInformation(this.sessionData.currentBooking.preferredLocation);
  }

  async navigateToContactDetailsPage(): Promise<void> {
    await this.navigateToPeferredLocationsPage();
    await verifyTitleContainsText(`${this.contactDetailsPage.pageHeadingNSA}`);
    await this.contactDetailsPage.enterContactDetails(this.sessionData.candidate.email, this.sessionData.candidate.email);
  }

  async navigateToTelephonePage(): Promise<void> {
    await this.navigateToContactDetailsPage();
    await verifyTitleContainsText(`${this.telephoneContactPage.pageHeading}`);
    if (this.sessionData.candidate.telephone) {
      await this.telephoneContactPage.selectTelephoneContactPreference(true);
      await this.telephoneContactPage.enterTelephoneNumber(this.sessionData.candidate.telephone);
    } else {
      await this.telephoneContactPage.selectTelephoneContactPreference(false);
      await click(this.telephoneContactPage.continueButton);
    }
  }

  async navigateToVoicemailConsentPage(): Promise<void> {
    await this.navigateToTelephonePage();
    if (this.sessionData.candidate.telephone) {
      await verifyTitleContainsText(`${this.voicemailConsentPage.pageHeading}`);
      await this.voicemailConsentPage.selectVoicemailConsentGiven(this.sessionData.currentBooking.voicemail);
    }
  }

  async navigateToCheckYourDetailsPage(): Promise<void> {
    await this.navigateToVoicemailConsentPage();
    await verifyTitleContainsText(`${this.checkYourDetailsPage.pageHeading}`);
    await this.checkYourDetailsPage.checkDataMatchesSession(this.sessionData);
    await this.checkYourDetailsPage.continueBooking();
  }

  async sendNsaBookingRequest(): Promise<BookingConfirmationPage> {
    await this.navigateToCheckYourDetailsPage();

    let confirmationPageTitle = '';
    let bookingRefLocator = '';
    if (this.path === EvidencePathNames.EVIDENCE_REQUIRED) {
      confirmationPageTitle = this.bookingConfirmationPage.pageHeadingNSAEvidence;
      bookingRefLocator = this.bookingConfirmationPage.bookingReferenceLocatorNSAEvidence;
    } else if (this.path === EvidencePathNames.EVIDENCE_NOT_REQUIRED || this.path === EvidencePathNames.EVIDENCE_MAY_BE_REQUIRED) {
      confirmationPageTitle = this.bookingConfirmationPage.pageHeadingNSANoEvidence;
      bookingRefLocator = this.bookingConfirmationPage.bookingReferenceLocator;
    }

    await verifyTitleContainsText(confirmationPageTitle, MAX_TIMEOUT);
    this.sessionData.currentBooking.bookingRef = await getText(bookingRefLocator);
    await this.bookingConfirmationPage.checkDataMatchesSessionNSA(this.sessionData, this.path);
    return this.bookingConfirmationPage;
  }
}
