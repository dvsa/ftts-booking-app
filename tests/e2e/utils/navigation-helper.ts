import { t } from 'testcafe';
import { StartPage } from '../pages/start-page';
import {
  capitalizeFirstLetter, getText, runningTestsLocally, verifyExactText,
} from './helpers';
import { ChooseATestCentrePage } from '../pages/choose-a-test-centre-page';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { CandidateDetailsPage } from '../pages/candidate-details-page';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { TestTypePage } from '../pages/test-type-page';
import { LanguagePage } from '../pages/language-page';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { CheckYourAnswersPage } from '../pages/check-your-answers-page';
import { PaymentsPage } from '../pages/payments-page';
import { SessionData } from '../data/session-data';
import { TARGET } from '../../../src/domain/enums';
import { LANGUAGES, testPayment } from '../data/constants';

export class NavigationHelper {
  sessionData: SessionData;

  constructor(sessionData: SessionData) {
    this.sessionData = sessionData;
  }

  async navigateToChooseSupportPage(): Promise<ChooseSupportPage> {
    await t.navigateTo(`${process.env.BOOKING_APP_URL}?target=${this.sessionData.target}&lang=${this.sessionData.locale}`);
    const startPage: StartPage = new StartPage();
    const chooseSupportPage = await startPage.startBooking();
    return chooseSupportPage;
  }

  async navigateToCandidateDetailsPage(): Promise<CandidateDetailsPage> {
    const chooseSupportPage = await this.navigateToChooseSupportPage();
    if (this.sessionData.journey.support) {
      throw new Error('Please use NavigationHelperNSA for Non-Standard Accommodation journeys!');
    }
    // always set to no for standard accommodation journeys
    const candidateDetailsPage = await chooseSupportPage.selectSupportRequired(false);
    return candidateDetailsPage;
  }

  async navigateToContactDetailsPage(): Promise<ContactDetailsPage> {
    const candidateDetailsPage = await this.navigateToCandidateDetailsPage();
    await candidateDetailsPage.enterCandidateDetailsAndSubmit(this.sessionData.candidate);
    return new ContactDetailsPage();
  }

  async navigateToTestTypePage(): Promise<TestTypePage> {
    const contactDetailsPage = await this.navigateToContactDetailsPage();
    const testTypePage = await contactDetailsPage.enterContactDetails(this.sessionData.candidate.email, this.sessionData.candidate.email);
    return testTypePage;
  }

  async navigateToNiTestTypePage(): Promise<TestTypePage> {
    const contactDetailsPage = await this.navigateToContactDetailsPage();
    const testTypePage = await contactDetailsPage.enterContactDetails(this.sessionData.candidate.email, this.sessionData.candidate.email);
    return testTypePage;
  }

  async navigateToLanguagePage(): Promise<LanguagePage> {
    const testTypePage = await this.navigateToTestTypePage();
    const languagePage = await testTypePage.selectTestCategoryGB(capitalizeFirstLetter(this.sessionData.currentBooking.testType));
    return languagePage;
  }

  async navigateToFindTestCentrePage(): Promise<FindATheoryTestCentrePage> {
    let findATheoryTestCentrePage: FindATheoryTestCentrePage;

    if (this.sessionData.target === TARGET.GB) {
      const languagePage = await this.navigateToLanguagePage();
      findATheoryTestCentrePage = await languagePage.selectTestLanguage(LANGUAGES.get(this.sessionData.currentBooking.language));
    } else if (this.sessionData.target === TARGET.NI) {
      const testTypePage = await this.navigateToNiTestTypePage();
      findATheoryTestCentrePage = await testTypePage.selectTestCategoryNI(capitalizeFirstLetter(this.sessionData.currentBooking.testType));
    }

    return findATheoryTestCentrePage;
  }

  async navigateToChooseTestCentrePage(): Promise<ChooseATestCentrePage> {
    const findATheoryTestCentrePage = await this.navigateToFindTestCentrePage();
    const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre(this.sessionData.testCentreSearch.searchQuery);
    return chooseATestCentrePage;
  }

  async navigateToPreferredDatePage(): Promise<PreferredDatePage> {
    const chooseATestCentrePage = await this.navigateToChooseTestCentrePage();
    const preferredDatePage = await chooseATestCentrePage.selectATestCentre(this.sessionData.currentBooking.centre);
    return preferredDatePage;
  }

  async navigateToChooseAppointmentPage(): Promise<ChooseAppointmentPage> {
    const preferredDatePage = await this.navigateToPreferredDatePage();
    let chooseAppointmentPage: ChooseAppointmentPage;
    if (this.sessionData.testDateLessThan3Days === true) {
      chooseAppointmentPage = await preferredDatePage.selectPreferredDateLessThan3Days(this.sessionData.testCentreSearch);
    } else {
      chooseAppointmentPage = await preferredDatePage.selectPreferredDateWithAppointments(this.sessionData.testCentreSearch);
    }
    return chooseAppointmentPage;
  }

  async navigateToCheckBookingPage(): Promise<CheckYourAnswersPage> {
    const chooseAppointmentPage = await this.navigateToChooseAppointmentPage();
    const checkYourBookingPage = await chooseAppointmentPage.chooseAppointment(this.sessionData.currentBooking);
    await checkYourBookingPage.checkDataMatchesSession(this.sessionData);
    return checkYourBookingPage;
  }

  async navigateToPaymentsPage(): Promise<PaymentsPage> {
    const checkYourAnswersPage = await this.navigateToCheckBookingPage();
    const makePaymentPage = await checkYourAnswersPage.continueBooking();
    return makePaymentPage;
  }

  async createANewBooking(): Promise<BookingConfirmationPage> {
    const makePaymentPage = await this.navigateToPaymentsPage();
    if (!runningTestsLocally()) {
      await makePaymentPage.makePayment(testPayment, this.sessionData.candidate.email);
    }

    // required as sometimes payment screen takes a long time to finish
    const bookingConfirmationPage = new BookingConfirmationPage();
    await verifyExactText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingSA, 0, 60000);
    this.sessionData.currentBooking.bookingRef = await getText(bookingConfirmationPage.bookingReferenceLocatorSA);
    await bookingConfirmationPage.checkDataMatchesSession(this.sessionData);
    return bookingConfirmationPage;
  }
}
