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
import { Target, TestType } from '../../../src/domain/enums';
import { Languages, MAX_TIMEOUT } from '../data/constants';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { VoiceoverPage } from '../pages/voiceover-page';

export class NavigationHelperInstructor {
  sessionData: SessionData;

  chooseSupportPage = new ChooseSupportPage();

  languagePage = new LanguagePage();

  voiceoverPage = new VoiceoverPage();

  constructor(sessionData: SessionData) {
    this.sessionData = sessionData;
  }

  async navigateToChooseSupportPage(): Promise<ChooseSupportPage> {
    await setAcceptCookies();
    await t.navigateTo(`${process.env.BOOKING_APP_URL}/instructor?target=${this.sessionData.target}`);
    return this.chooseSupportPage;
  }

  async navigateToCandidateDetailsPage(): Promise<CandidateDetailsPage> {
    await this.navigateToChooseSupportPage();

    // always set to no for standard accommodation journeys
    if (this.sessionData.journey.support) {
      throw new Error('Please use NavigationHelperNSA for Non-Standard Accommodation journeys!');
    }

    if (this.sessionData.target === Target.GB) {
      const chooseSupportPage = new ChooseSupportPage();
      await chooseSupportPage.selectSupportRequired(false);
    }
    return new CandidateDetailsPage();
  }

  async navigateToContactDetailsPage(): Promise<ContactDetailsPage> {
    if (this.sessionData.target === Target.NI) {
      await this.navigateToChooseSupportPage();
      const candidateDetailsPage = new CandidateDetailsPage();
      await verifyTitleContainsText(`${candidateDetailsPage.pageHeading}`);
      await candidateDetailsPage.enterInstructorCandidateDetailsAndSubmit(this.sessionData.candidate, this.sessionData.target as Target);
    } else if (this.sessionData.target === Target.GB) {
      const candidateDetailsPage = await this.navigateToCandidateDetailsPage();
      await verifyTitleContainsText(`${candidateDetailsPage.pageHeading}`);
      await candidateDetailsPage.enterInstructorCandidateDetailsAndSubmit(this.sessionData.candidate, this.sessionData.target as Target);
    }
    return new ContactDetailsPage();
  }

  async navigateToTestTypePage(): Promise<void> {
    if (this.sessionData.hasComeFromNsaJourney) {
      const contactDetailsPage = new ContactDetailsPage();
      await contactDetailsPage.enterContactDetails(this.sessionData.candidate.email, this.sessionData.candidate.email);
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
    if (this.sessionData.changeSupport) {
      const testTypePage = new TestTypePage();
      if (this.sessionData.isCompensationBooking) {
        await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
      }
      await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
    }
    const testTypePage = new TestTypePage();
    await this.navigateToTestTypePage();
    if (this.sessionData.isCompensationBooking) {
      await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
    }
    await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
  }

  async navigateToVoiceoverPage(): Promise<void> {
    if (this.sessionData.hasComeFromNsaJourney) {
      await this.navigateToTestTypePage();
    } else if (this.sessionData.target === Target.GB && this.sessionData.currentBooking.testType !== TestType.ERS) {
      await this.navigateToLanguagePage();
      await this.languagePage.selectTestLanguage(Languages.get(this.sessionData.currentBooking.language));
    } else if (this.sessionData.target === Target.NI || this.sessionData.currentBooking.testType === TestType.ERS) {
      const testTypePage = await this.navigateToNiTestTypePage();
      if (this.sessionData.isCompensationBooking) {
        await testTypePage.verifyCompensationTextShown(this.sessionData.currentBooking.testType);
      }
      await testTypePage.selectTestCategory(this.sessionData.currentBooking.testType);
    }
    if (this.sessionData.target === Target.GB && !this.sessionData.hasComeFromNsaJourney) {
      await this.voiceoverPage.selectVoiceoverRequired(this.sessionData.currentBooking.voiceover);
    }
  }

  async navigateToFindTestCentrePage(): Promise<FindATheoryTestCentrePage> {
    await this.navigateToVoiceoverPage();
    const findATheoryTestCentrePage = new FindATheoryTestCentrePage();
    return findATheoryTestCentrePage;
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

  async navigateToPaymentsPage(): Promise<void> {
    const checkYourDetailsPage = await this.navigateToCheckBookingPage();
    await checkYourDetailsPage.continueBooking();
  }

  async createANewBooking(): Promise<BookingConfirmationPage> {
    await this.navigateToPaymentsPage();
    if (this.sessionData.target === Target.GB && !this.sessionData.isCompensationBooking && !runningTestsLocally()) {
      const makePaymentPage = new PaymentsPage();
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
