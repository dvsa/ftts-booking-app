/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import { runAxe } from '@testcafe-community/axe';
import { createHtmlReport } from 'axe-html-reporter';
import * as Constants from '../data/constants';
import {
  verifyExactText, click, setCookie, clearField, runningTestsLocally, verifyContainsText,
} from '../utils/helpers';
import { CandidateDetailsPage } from '../pages/candidate-details-page';
import { TestTypePage } from '../pages/test-type-page';
import { LanguagePage } from '../pages/language-page';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { ChooseATestCentrePage } from '../pages/choose-a-test-centre-page';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { CheckYourDetailsPage } from '../pages/check-your-details-page';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { FindATheoryTestCentreErrorPage } from '../pages/find-a-theory-test-centre-error-page';
import { WhatDoYouWantToChangePage } from '../pages/what-do-you-want-to-change-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { Locale, Target, Voiceover } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { CancelBookingPage } from '../pages/cancel-booking-page';
import { CancelledBookingPage } from '../pages/cancelled-booking-page';
import { NavigationHelper } from '../utils/navigation-helper';
import { CheckChangePage } from '../pages/check-change-page';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';
import { StayingNSAPage } from '../pages/staying-nsa-page';
import { CustomSupportPage } from '../pages/custom-support-page';
import { NsaVoiceoverPage } from '../pages/nsa-voiceover-page';
import { LeavingNsaPage } from '../pages/leaving-nsa-page';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { NsaVoicemailPage } from '../pages/nsa-voicemail-page';
import { PreferredDayNSAPage } from '../pages/preferred-day-nsa-page';
import { PreferredLocationNSAPage } from '../pages/preferred-location-nsa-page';
import { NsaTelephoneContactPage } from '../pages/nsa-telephone-contact-page';
import { CheckYourDetailsNsaPage } from '../pages/check-your-details-nsa-page';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';

const sessionData = new SessionData(Target.GB);
const sessionDataNsa = new SessionData(Target.GB, Locale.GB, true);
const navigationHelper: NavigationHelper = new NavigationHelper(sessionData);
const navigationHelperNsa: NavigationHelperNSA = new NavigationHelperNSA(sessionDataNsa);
const baseUrl = process.env.BOOKING_APP_URL;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});
let bookingRef: string;
let drivingLicence: string;
const bookingRefForEnvironment = 'B-000-118-620';
const drivingLicenceForEnvironment = 'BENTO603026A97BQ';
const chooseSupportPage: ChooseSupportPage = new ChooseSupportPage();
const candidateDetailsPage: CandidateDetailsPage = new CandidateDetailsPage();
const loginPage: LoginPage = new LoginPage();
const changeBookingPage: ChangeBookingPage = new ChangeBookingPage();
const cancelBookingPage: CancelBookingPage = new CancelBookingPage();
const cancelledBookingPage: CancelledBookingPage = new CancelledBookingPage();
const checkChangePage: CheckChangePage = new CheckChangePage();
const whatDoYouWantToChangePage = new WhatDoYouWantToChangePage();
const changeConfirmedPage: ChangeConfirmedPage = new ChangeConfirmedPage();

fixture`Online booking app accessibility tests - DVSA (GB)`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => {
    bookingRef = runningTestsLocally() ? Constants.bookingReference1 : bookingRefForEnvironment;
    drivingLicence = runningTestsLocally() ? Constants.drivingLicenceGB : drivingLicenceForEnvironment;
    await setCookie(headerLogger, new SessionData(Target.GB));
  })
  .afterEach(async (t) => { await runAxeCheck(t); })
  .clientScripts({ module: 'axe-core/axe.min.js' })
  .meta('type', 'accessibility');

test('Accessibility test - Choose support page', async (t) => {
  await navigationHelper.navigateToChooseSupportPage();
  t.ctx.page = chooseSupportPage.pathUrl;
  await verifyExactText(chooseSupportPage.pageHeadingLocator, chooseSupportPage.pageHeading);
});

test('Accessibility test - Candidate details page', async (t) => {
  await navigationHelper.navigateToCandidateDetailsPage();
  t.ctx.page = candidateDetailsPage.pathUrl;
  await verifyExactText(candidateDetailsPage.pageHeadingLocator, candidateDetailsPage.pageHeading);
});

test('Accessibility test - Candidate details with support page', async (t) => {
  await navigationHelperNsa.navigateToCandidateDetailsPage();
  t.ctx.page = `${candidateDetailsPage.pathUrl}-with-support`;
  await t.navigateTo(`${baseUrl}/${candidateDetailsPage.pathUrl}`);
  await verifyExactText(candidateDetailsPage.pageHeadingLocator, candidateDetailsPage.pageHeadingSupport);
});

test('Accessibility test - Candidate details page - with error', async (t) => {
  await navigationHelper.navigateToCandidateDetailsPage();
  t.ctx.page = `${candidateDetailsPage.pathUrl}-error`;
  await verifyExactText(candidateDetailsPage.pageHeadingLocator, candidateDetailsPage.pageHeading);
  await click(candidateDetailsPage.submitButton);
});

test('Accessibility test - Contact details page', async (t) => {
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  t.ctx.page = contactDetailsPage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Accessibility test - Contact details page - with error', async (t) => {
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  t.ctx.page = `${contactDetailsPage.pathUrl}-error`;
  await navigationHelper.navigateToContactDetailsPage();
  await click(contactDetailsPage.continueButton);
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Accessibility test - Theory test type page', async (t) => {
  const testTypePage: TestTypePage = new TestTypePage();
  t.ctx.page = testTypePage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
});

test('Accessibility test - Theory test type page - with error', async (t) => {
  const testTypePage: TestTypePage = new TestTypePage();
  t.ctx.page = `${testTypePage.pathUrl}-error`;

  await t.navigateTo(process.env.BOOKING_APP_URL);
  await navigationHelper.navigateToTestTypePage();
  await click(testTypePage.continueButton);
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
});

test('Accessibility test - Test language page', async (t) => {
  const languagePage: LanguagePage = new LanguagePage();
  t.ctx.page = languagePage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(languagePage.pageHeadingLocator, languagePage.pageHeading);
});

test('Accessibility test - Test language page - with error', async (t) => {
  const languagePage: LanguagePage = new LanguagePage();
  t.ctx.page = `${languagePage.pathUrl}-error`;

  await t.navigateTo(process.env.BOOKING_APP_URL);
  await navigationHelper.navigateToLanguagePage();
  await click(languagePage.continueButton);
  await verifyExactText(languagePage.pageHeadingLocator, languagePage.pageHeading);
});

test('Accessibility test - Find a theory test centre page', async (t) => {
  const findATheoryTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  t.ctx.page = findATheoryTestCentrePage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(findATheoryTestCentrePage.pageHeadingLocator, findATheoryTestCentrePage.pageHeading);
});

test('Accessibility test - Find a theory test centre page - with error', async (t) => {
  const findATheoryTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  t.ctx.page = `${findATheoryTestCentrePage.pathUrl}-error`;
  await t.navigateTo(`${baseUrl}/${findATheoryTestCentrePage.pathUrl}`);
  await clearField(findATheoryTestCentrePage.searchLocationTermTextBox);
  await click(findATheoryTestCentrePage.findButton);
  await verifyExactText(findATheoryTestCentrePage.pageHeadingLocator, findATheoryTestCentrePage.pageHeading);
});

test('Accessibility test - Find a theory test centre error page', async (t) => {
  const findATheoryTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  const findATheoryTestCentreErrorPage: FindATheoryTestCentreErrorPage = new FindATheoryTestCentreErrorPage();
  t.ctx.page = `${findATheoryTestCentrePage.pathUrl}-error-page`;
  await t.navigateTo(`${baseUrl}/${findATheoryTestCentrePage.pathUrl}`);
  await findATheoryTestCentrePage.findATheoryTestCentre(Constants.searchWithError);
  await verifyExactText(findATheoryTestCentreErrorPage.pageHeadingLocator, findATheoryTestCentreErrorPage.pageHeading);
});

test('Accessibility test - Select a theory test centre page', async (t) => {
  const chooseATestCentrePage: ChooseATestCentrePage = new ChooseATestCentrePage();
  t.ctx.page = chooseATestCentrePage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(chooseATestCentrePage.pageHeadingLocator, chooseATestCentrePage.pageHeading);
});

test('Accessibility test - Enter preferred date page', async (t) => {
  const preferredDatePage: PreferredDatePage = new PreferredDatePage();
  t.ctx.page = preferredDatePage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
});

test('Accessibility test - Enter preferred date page - with error', async (t) => {
  const preferredDatePage: PreferredDatePage = new PreferredDatePage();
  t.ctx.page = `${preferredDatePage.pathUrl}-error`;
  await t.navigateTo(`${baseUrl}/${preferredDatePage.pathUrl}`);
  await clearField(preferredDatePage.monthTextBox);
  await click(preferredDatePage.continueButton);
  await verifyExactText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
});

test('Accessibility test - Enter preferred date page - date picker shown', async (t) => {
  const preferredDatePage: PreferredDatePage = new PreferredDatePage();
  t.ctx.page = `${preferredDatePage.pathUrl}-date-picker`;
  await t.navigateTo(`${baseUrl}/${preferredDatePage.pathUrl}`);
  await preferredDatePage.showDatePicker();
  await verifyExactText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
});

test('Accessibility test - Choose appointment page', async (t) => {
  const preferredDatePage: PreferredDatePage = new PreferredDatePage();
  const chooseAppointmentPage: ChooseAppointmentPage = new ChooseAppointmentPage();
  t.ctx.page = chooseAppointmentPage.pathUrl;
  await t.navigateTo(`${baseUrl}/${preferredDatePage.pathUrl}`);
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
});

test('Accessibility test - Choose appointment page - preferred date not available', async (t) => {
  const preferredDatePage: PreferredDatePage = new PreferredDatePage();
  const chooseAppointmentPage: ChooseAppointmentPage = new ChooseAppointmentPage();
  t.ctx.page = `${chooseAppointmentPage.pathUrl}-error`;
  await t.navigateTo(`${baseUrl}/${preferredDatePage.pathUrl}`);
  await preferredDatePage.selectPreferredDateWithNoAppointments(sessionData.testCentreSearch);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
});

test('Accessibility test - Check your details page (Standard accommodations)', async (t) => {
  const checkYourDetailsPage: CheckYourDetailsPage = new CheckYourDetailsPage();
  t.ctx.page = checkYourDetailsPage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyContainsText(checkYourDetailsPage.pageHeadingLocator, checkYourDetailsPage.pageHeading);
});

test('Accessibility test - Check your details page (Non-Standard accommodations)', async (t) => {
  const checkYourDetailsPage: CheckYourDetailsNsaPage = new CheckYourDetailsNsaPage();
  await setCookie(headerLogger, sessionDataNsa);
  t.ctx.page = checkYourDetailsPage.pathUrl.replace('/', '-');
  await t.navigateTo(`${baseUrl}/${checkYourDetailsPage.pathUrl}`);
  await verifyContainsText(checkYourDetailsPage.pageHeadingLocator, checkYourDetailsPage.pageHeading);
});

test('Accessibility test - What do you want to change page', async (t) => {
  t.ctx.page = whatDoYouWantToChangePage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(whatDoYouWantToChangePage.pageHeadingLocator, whatDoYouWantToChangePage.pageHeading);
});

test('Accessibility test - Booking confirmation page', async (t) => {
  const bookingConfirmationPage: BookingConfirmationPage = new BookingConfirmationPage();
  t.ctx.page = bookingConfirmationPage.pathUrl;
  await t.navigateTo(`${baseUrl}/${t.ctx.page}`);
  await verifyExactText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingSA);
});

test('Accessibility test - NSA Booking confirmation page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const bookingConfirmationPage: BookingConfirmationPage = new BookingConfirmationPage();
  t.ctx.page = `${bookingConfirmationPage.pathUrl}-nsa`;
  await t.navigateTo(`${baseUrl}/${bookingConfirmationPage.pathUrl}`);
  await verifyExactText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingNSA);
});

test('Accessibility test - Login page', async (t) => {
  t.ctx.page = loginPage.pathUrl.replace('/', '-');
  await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
  await verifyExactText(loginPage.pageHeadingLocator, loginPage.pageHeading);
});

test('Accessibility test - Login page - with error', async (t) => {
  t.ctx.page = `${loginPage.pathUrl.replace('/', '-')}-login-error`;
  await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageMissing);
  await verifyExactText(loginPage.pageHeadingLocator, loginPage.pageHeading);
});

test('Accessibility test - Manage bookings page', async (t) => {
  t.ctx.page = `${ManageBookingsPage.pathUrl.replace('/', '-')}-home`;
  await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence); // will only work in FTTS Shire
  await loginPage.submitDetails();
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
});

test('Accessibility test - Change bookings page', async (t) => {
  t.ctx.page = `${ManageBookingsPage.pathUrl.replace('/', '-')}-change`;
  await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence); // will only work in FTTS Shire
  await loginPage.submitDetails();
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyExactText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
});

test('Accessibility test - Cancel bookings page', async (t) => {
  t.ctx.page = `${ManageBookingsPage.pathUrl.replace('/', '-')}-cancel`;
  await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence); // will only work in FTTS Shire
  await loginPage.submitDetails();
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await verifyExactText(cancelBookingPage.pageHeadingLocator, cancelBookingPage.pageHeading);
});

// Only run on local, this will remove the booking that we're using for testing!
if (runningTestsLocally()) {
  test('Accessibility test - Cancelled bookings page', async (t) => {
    t.ctx.page = `${ManageBookingsPage.pathUrl.replace('/', '-')}-cancelled`;
    await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
    await loginPage.enterLoginDetails(bookingRef, drivingLicence); // will only work in FTTS Shire
    await loginPage.submitDetails();
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await changeBookingPage.cancelTest();
    await cancelBookingPage.confirmCancellation();
    await verifyExactText(cancelledBookingPage.pageHeadingLocator, cancelledBookingPage.pageHeading);
  });
}

test('Accessibility test - Reschedule booking - Check change page', async (t) => {
  t.ctx.page = `${ManageBookingsPage.pathUrl.replace('/', '-')}-reschedule-check`;
  await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence); // will only work in FTTS Shire
  await loginPage.submitDetails();
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.rescheduleTest();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
});

test('Accessibility test - Manage booking - Confirmed change page', async (t) => {
  t.ctx.page = `${ManageBookingsPage.pathUrl.replace('/', '-')}-change-confirmed`;
  await t.navigateTo(`${baseUrl}/${loginPage.pathUrl}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence); // will only work in FTTS Shire
  await loginPage.submitDetails();
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.rescheduleTest();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);
  await checkChangePage.confirmChange();
  await verifyExactText(changeConfirmedPage.pageHeadingLocator, changeConfirmedPage.pageHeading);
});

test('Accessibility test - Staying NSA page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const stayingNSAPage: StayingNSAPage = new StayingNSAPage();
  t.ctx.page = `${stayingNSAPage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${stayingNSAPage.pathUrl}`);
  await verifyExactText(stayingNSAPage.pageHeadingLocator, stayingNSAPage.pageHeading);
});

test('Accessibility test - Leaving NSA page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const leavingNsaPage: LeavingNsaPage = new LeavingNsaPage();
  t.ctx.page = `${leavingNsaPage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${leavingNsaPage.pathUrl}`);
  await verifyExactText(leavingNsaPage.pageHeadingLocator, leavingNsaPage.pageHeading);
});

test('Accessibility test - NSA Select Support Type page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const selectSupportTypePage: SelectSupportTypePage = new SelectSupportTypePage();
  t.ctx.page = `${selectSupportTypePage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${selectSupportTypePage.pathUrl}`);
  await verifyExactText(selectSupportTypePage.pageHeadingLocator, selectSupportTypePage.pageHeading);
});

test('Accessibility test - NSA Select Support Type page - with error', async (t) => {
  const sessionDataSupportType = new SessionData(Target.GB, Locale.GB, true);
  sessionDataSupportType.currentBooking.selectSupportType = [];
  await setCookie(headerLogger, sessionDataSupportType);
  const selectSupportTypePage: SelectSupportTypePage = new SelectSupportTypePage();
  t.ctx.page = `${selectSupportTypePage.pathUrl.replace('/', '-')}-error`;

  await t.navigateTo(`${baseUrl}/${selectSupportTypePage.pathUrl}`);
  await verifyExactText(selectSupportTypePage.pageHeadingLocator, selectSupportTypePage.pageHeading);
  await click(selectSupportTypePage.continueButton);
  await verifyExactText(selectSupportTypePage.pageHeadingLocator, selectSupportTypePage.pageHeading);
});

test('Accessibility test - NSA voiceover page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const nsaVoiceoverPage: NsaVoiceoverPage = new NsaVoiceoverPage();
  t.ctx.page = nsaVoiceoverPage.pathUrl.replace('/', '-');

  await t.navigateTo(`${baseUrl}/${nsaVoiceoverPage.pathUrl}`);
  await verifyExactText(nsaVoiceoverPage.pageHeadingLocator, nsaVoiceoverPage.pageHeading);
});

test('Accessibility test - NSA Voiceover page - with error', async (t) => {
  const sessionDataVoicover = new SessionData(Target.GB, Locale.GB, true);
  sessionDataVoicover.currentBooking.voiceover = Voiceover.NONE;
  await setCookie(headerLogger, sessionDataVoicover);
  const nsaVoiceoverPage: NsaVoiceoverPage = new NsaVoiceoverPage();
  t.ctx.page = `${nsaVoiceoverPage.pathUrl.replace('/', '-')}-error`;

  await t.navigateTo(`${baseUrl}/${nsaVoiceoverPage.pathUrl}`);
  await verifyExactText(nsaVoiceoverPage.pageHeadingLocator, nsaVoiceoverPage.pageHeading);
  await click(nsaVoiceoverPage.continueButton);
  await verifyExactText(nsaVoiceoverPage.pageHeadingLocator, nsaVoiceoverPage.pageHeading);
});

test('Accessibility test - NSA Voicemail page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const nsaVoicemailPage: NsaVoicemailPage = new NsaVoicemailPage();
  t.ctx.page = `${nsaVoicemailPage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${nsaVoicemailPage.pathUrl}`);
  await verifyExactText(nsaVoicemailPage.pageHeadingLocator, nsaVoicemailPage.pageHeading);
});

test('Accessibility test - NSA Voicemail page - with error', async (t) => {
  const sessionDataVoicemail = new SessionData(Target.GB, Locale.GB, true);
  sessionDataVoicemail.currentBooking.voicemail = undefined;
  await setCookie(headerLogger, sessionDataVoicemail);
  const nsaVoicemailPage: NsaVoicemailPage = new NsaVoicemailPage();
  t.ctx.page = `${nsaVoicemailPage.pathUrl.replace('/', '-')}-error`;

  await t.navigateTo(`${baseUrl}/${nsaVoicemailPage.pathUrl}`);
  await verifyExactText(nsaVoicemailPage.pageHeadingLocator, nsaVoicemailPage.pageHeading);
  await click(nsaVoicemailPage.continueButton);
  await verifyExactText(nsaVoicemailPage.pageHeadingLocator, nsaVoicemailPage.pageHeading);
});

test('Accessibility test - NSA Telephone contact page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const nsaTelephoneContactPage: NsaTelephoneContactPage = new NsaTelephoneContactPage();
  t.ctx.page = `${nsaTelephoneContactPage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${nsaTelephoneContactPage.pathUrl}`);
  await verifyExactText(nsaTelephoneContactPage.pageHeadingLocator, nsaTelephoneContactPage.pageHeading);
});

test('Accessibility test - NSA Custom support page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const customSupportPage: CustomSupportPage = new CustomSupportPage();
  t.ctx.page = `${customSupportPage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${customSupportPage.pathUrl}`);
  await verifyExactText(customSupportPage.pageHeadingLocator, customSupportPage.pageHeading);
});

test('Accessibility test - NSA Preferred Day page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const preferredDayNSAPage: PreferredDayNSAPage = new PreferredDayNSAPage();
  t.ctx.page = `${preferredDayNSAPage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${preferredDayNSAPage.pathUrl}`);
  await verifyContainsText(preferredDayNSAPage.pageHeadingLocator, preferredDayNSAPage.pageHeading);
});

test('Accessibility test - NSA Preferred Location page', async (t) => {
  await setCookie(headerLogger, sessionDataNsa);
  const preferredLocationNSAPage: PreferredLocationNSAPage = new PreferredLocationNSAPage();
  t.ctx.page = `${preferredLocationNSAPage.pathUrl.replace('/', '-')}`;

  await t.navigateTo(`${baseUrl}/${preferredLocationNSAPage.pathUrl}`);
  await verifyContainsText(preferredLocationNSAPage.pageHeadingLocator, preferredLocationNSAPage.pageHeading);
});

async function runAxeCheck(t: TestController) {
  await t.takeScreenshot({ fullPage: true });
  const { error, results } = await runAxe();
  await t.expect(error).eql(null, `Axe check failed with an error: ${error}`);
  const reportFileName = `${t.ctx.page}.html`;

  createHtmlReport({
    results,
    options: {
      projectKey: 'FTTS Online Booking App - DVSA (GB)',
      outputDir: 'axe-reports-gb',
      reportFileName,
    },
  });

  if (results.violations.length > 0) {
    let violations = '\n';
    for (let i = 0; i < results.violations.length; i++) {
      violations += `\n${results.violations[i].help}: ${results.violations[i].description}\n`;
    }
    await t.expect(results.violations.length).eql(0, `Axe check failed with violations (see ${reportFileName} for full description) Summary: ${violations}`);
  }
}
