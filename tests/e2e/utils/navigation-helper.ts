import { t } from 'testcafe';
import dayjs from 'dayjs';
import {
  getText, runningTestsLocally, setAcceptCookies, verifyTitleContainsText, verifyContainsText,
} from './helpers';
import { ChooseATestCentrePage } from '../pages/choose-a-test-centre-page';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { CandidateDetailsPage } from '../pages/candidate-details-page';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { TestTypePage } from '../pages/test-type-page';
import { LanguagePage } from '../pages/language-page';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { CheckYourDetailsPage } from '../pages/check-your-details-page';
import { PaymentsPage } from '../pages/payments-page';
import { SessionData } from '../data/session-data';
import {
  SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { Languages, MAX_TIMEOUT } from '../data/constants';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { SelectStandardSupportPage } from '../pages/select-standard-support-page';
import { VoiceoverPage } from '../pages/voiceover-page';

export class NavigationHelper {
  sessionData: SessionData;

  selectStandardSupportPage = new SelectStandardSupportPage();

  chooseSupportPage = new ChooseSupportPage();

  languagePage = new LanguagePage();

  voiceoverPage = new VoiceoverPage();

  constructor(sessionData: SessionData) {
    this.sessionData = sessionData;
  }

  async navigateToChooseSupportPage(): Promise<ChooseSupportPage> {
    await setAcceptCookies();
    await t.navigateTo(`${process.env.BOOKING_APP_URL}?target=${this.sessionData.target}`);
    return this.chooseSupportPage;
  }

  async navigateToCandidateDetailsPage(): Promise<CandidateDetailsPage> {
    await this.navigateToChooseSupportPage();

    // always set to no for standard accommodation journeys
    if (this.sessionData.journey.support) {
      throw new Error('Please use NavigationHelperNSA for Non-Standard Accommodation journeys!');
    }
    const chooseSupportPage = new ChooseSupportPage();
    await chooseSupportPage.selectSupportRequired(false);
    return new CandidateDetailsPage();
  }

  async navigateToContactDetailsPage(): Promise<ContactDetailsPage> {
    const candidateDetailsPage = await this.navigateToCandidateDetailsPage();
    await candidateDetailsPage.enterCandidateDetailsAndSubmit(this.sessionData.candidate);
    return new ContactDetailsPage();
  }

  async navigateToTestTypePage(): Promise<void> {
    if (this.sessionData.hasComeFromNsaJourney) {
      const contactDetailsPage = new ContactDetailsPage();
      await contactDetailsPage.enterContactDetails(this.sessionData.candidate.email, this.sessionData.candidate.email);
    } else if (this.sessionData.changeSupport) {
      const contactDetailsPage = new ContactDetailsPage();
      await contactDetailsPage.clickContinue();
    } else {
      const contactDetailsPage = await this.navigateToContactDetailsPage();
      await contactDetailsPage.enterContactDetails(this.sessionData.candidate.email, this.sessionData.candidate.email);
    }
  }

  async navigateToNiTestTypePage(): Promise<TestTypePage> {
    const contactDetailsPage = await this.navigateToContactDetailsPage();
    const testTypePage = await contactDetailsPage.enterContactDetails(this.sessionData.candidate.email, this.sessionData.candidate.email);
    return testTypePage;
  }

  async navigateToLanguagePage(): Promise<void> {
    const testTypePage = new TestTypePage();
    await this.navigateToTestTypePage();
    if (this.sessionData.isCompensationBooking) {
      await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
    }
    await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
  }

  async navigateToSelectStandardSupportPage(): Promise<void> {
    if (this.sessionData.hasComeFromNsaJourney) {
      await this.navigateToTestTypePage();
    } else if (this.sessionData.target === Target.GB) {
      await this.navigateToLanguagePage();
      await this.languagePage.selectTestLanguage(Languages.get(this.sessionData.currentBooking.language));
    } else if (this.sessionData.target === Target.NI) {
      const testTypePage = await this.navigateToNiTestTypePage();
      if (this.sessionData.isCompensationBooking) {
        await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
      }
      await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
    }
  }

  async navigateToFindTestCentrePage(): Promise<FindATheoryTestCentrePage> {
    await this.navigateToSelectStandardSupportPage();

    if (!this.sessionData.hasComeFromNsaJourney) {
      // check the test type
      if (this.sessionData.currentBooking.testType === TestType.CAR || this.sessionData.currentBooking.testType === TestType.MOTORCYCLE) {
        // if we have BSL, make sure we select it now
        if (this.sessionData.currentBooking.bsl) {
          await this.selectStandardSupportPage.selectSupportTypeRequired(SupportType.ON_SCREEN_BSL);
        } else if (this.sessionData.currentBooking.voiceover !== Voiceover.NONE) {
          await this.selectStandardSupportPage.selectSupportTypeRequired(SupportType.VOICEOVER);
        } else {
          await this.selectStandardSupportPage.selectSupportTypeRequired(SupportType.NO_SUPPORT_WANTED);
        }
      } else { // other test types will only have Voiceover
        await this.voiceoverPage.selectVoiceoverRequired(this.sessionData.currentBooking.voiceover);
      }
    }
    return new FindATheoryTestCentrePage();
  }

  async navigateToChooseTestCentrePage(): Promise<ChooseATestCentrePage> {
    const findATheoryTestCentrePage = await this.navigateToFindTestCentrePage();
    const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre(this.sessionData.testCentreSearch.searchQuery);
    return chooseATestCentrePage;
  }

  async navigateToPreferredDatePage(): Promise<PreferredDatePage> {
    const chooseATestCentrePage = await this.navigateToChooseTestCentrePage();
    const preferredDatePage = await chooseATestCentrePage.selectATestCentreWithName(this.sessionData.currentBooking.centre.name, this.sessionData.currentBooking.centre);
    return preferredDatePage;
  }

  async navigateToChooseAppointmentPage(): Promise<ChooseAppointmentPage> {
    const preferredDatePage = await this.navigateToPreferredDatePage();
    let chooseAppointmentPage: ChooseAppointmentPage;
    if (this.sessionData.testDateLessThan3Days === true) {
      chooseAppointmentPage = await preferredDatePage.selectPreferredDateLessThan3Days(this.sessionData.testCentreSearch);
    } else if (this.sessionData.specificDate) {
      const preferredDate = dayjs(this.sessionData.testCentreSearch.selectedDate);
      chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit(
        preferredDate.format('DD'),
        preferredDate.format('MM'),
        preferredDate.format('YYYY'),
      );
    } else {
      chooseAppointmentPage = await preferredDatePage.selectPreferredDateWithAppointments(this.sessionData.testCentreSearch);
    }
    return chooseAppointmentPage;
  }

  async navigateToCheckBookingPage(): Promise<CheckYourDetailsPage> {
    const chooseAppointmentPage = await this.navigateToChooseAppointmentPage();
    const checkYourBookingPage = await chooseAppointmentPage.chooseAppointment(this.sessionData.currentBooking);

    await checkYourBookingPage.checkDataMatchesSession(this.sessionData);
    return checkYourBookingPage;
  }

  async navigateToPaymentsPage(): Promise<PaymentsPage> {
    const checkYourDetailsPage = await this.navigateToCheckBookingPage();
    const makePaymentPage = await checkYourDetailsPage.continueBooking();
    return makePaymentPage;
  }

  async createANewBooking(): Promise<BookingConfirmationPage> {
    const makePaymentPage = await this.navigateToPaymentsPage();
    if (!this.sessionData.isCompensationBooking && !runningTestsLocally()) {
      await makePaymentPage.makePayment(this.sessionData.paymentDetails, this.sessionData.candidate.email);
    }

    // required as sometimes payment screen takes a long time to finish
    const bookingConfirmationPage = new BookingConfirmationPage();
    await verifyTitleContainsText(`${bookingConfirmationPage.pageHeadingSA}`, MAX_TIMEOUT);
    await verifyContainsText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingSA);
    this.sessionData.currentBooking.bookingRef = await getText(bookingConfirmationPage.bookingReferenceLocator);
    await bookingConfirmationPage.checkDataMatchesSession(this.sessionData);
    return bookingConfirmationPage;
  }
}
