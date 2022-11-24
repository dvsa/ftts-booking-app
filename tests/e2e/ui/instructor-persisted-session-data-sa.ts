/* eslint-disable security/detect-non-literal-regexp */
import { Selector } from 'testcafe';
import { verifyExactText, verifyTitleContainsText } from '../utils/helpers';
import { NavigationHelperInstructor } from '../utils/navigation-helper-instructor';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { ChooseATestCentrePage } from '../pages/choose-a-test-centre-page';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { LanguagePage } from '../pages/language-page';
import { TestTypePage } from '../pages/test-type-page';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { SessionData } from '../data/session-data';
import { Locale, Target, TestType } from '../../../src/domain/enums';
import { generalTitle, generalTitleNI, setRequestTimeout } from '../data/constants';
import { VoiceoverPage } from '../pages/voiceover-page';

const chooseAppointmentPage = new ChooseAppointmentPage();
const preferredDatePage = new PreferredDatePage();
const chooseATestCentrePage = new ChooseATestCentrePage();
const findATheoryTestCentrePage = new FindATheoryTestCentrePage();
const languagePage = new LanguagePage();
const testTypePage = new TestTypePage();
const contactDetailsPage = new ContactDetailsPage();
const voiceoverPage = new VoiceoverPage();

fixture`Instructor - Persisted session data - Standard accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await setRequestTimeout; })
  .meta('type', 'instructor');

test('GB Candidate Standard Accommodations (ADI) - Verify that session data is persisted when using the back links - from start to choose appointment', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  const navigationHelper = new NavigationHelperInstructor(sessionData);

  // go through the booking journey until choose appointment
  await navigationHelper.navigateToFindTestCentrePage();
  await findATheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  await chooseATestCentrePage.selectATestCentre(sessionData.currentBooking.centre);
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
  await verifyExactText(chooseAppointmentPage.testCentreNameLocator, sessionData.currentBooking.centre.name);

  await chooseAppointmentPage.goBack();
  await verifyTitleContainsText(`${preferredDatePage.pageHeading} ${generalTitle}`);
  await verifyExactText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
  await t.expect(Selector(preferredDatePage.dayTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.monthTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.yearTextBox).value).notEql('');

  await preferredDatePage.goBack();
  await verifyExactText(chooseATestCentrePage.pageHeadingLocator, chooseATestCentrePage.pageHeading);
  await verifyExactText(chooseATestCentrePage.searchQueryValue, sessionData.testCentreSearch.searchQuery);

  await chooseATestCentrePage.goBack();
  await verifyExactText(findATheoryTestCentrePage.pageHeadingLocator, findATheoryTestCentrePage.pageHeading);
  await t.expect(Selector(findATheoryTestCentrePage.searchLocationTermTextBox).value).eql(sessionData.testCentreSearch.searchQuery);

  await findATheoryTestCentrePage.goBack();
  await verifyTitleContainsText(voiceoverPage.pageHeading);
  await verifyExactText(voiceoverPage.pageHeadingLocator, voiceoverPage.pageHeading);
  await t.expect(Selector(voiceoverPage.noVoiceoverRadioButton).checked).ok();

  await voiceoverPage.goBack();
  await verifyExactText(languagePage.pageHeadingLocator, languagePage.pageHeading);
  await t.expect(Selector(languagePage.testLanguageButtonEnglish).checked).ok();

  await languagePage.goBack();
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  await t.expect(Selector(testTypePage.getTestTypeSelector(TestType.ADIP1)).checked).ok();

  await testTypePage.goBack();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
});

test('NI Candidate Standard Accommodations (ADI) - Verify that session data is persisted when using the back links - from start to choose appointment', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1DVA;
  sessionData.candidate.paymentReceiptNumber = '92647';
  const navigationHelper = new NavigationHelperInstructor(sessionData);

  // go through the booking journey until choose appointment
  await navigationHelper.navigateToFindTestCentrePage();
  await findATheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  await chooseATestCentrePage.selectATestCentre(sessionData.currentBooking.centre);
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
  await verifyExactText(chooseAppointmentPage.testCentreNameLocator, sessionData.currentBooking.centre.name);

  await chooseAppointmentPage.goBack();
  await verifyTitleContainsText(`${preferredDatePage.pageHeading} ${generalTitleNI}`);
  await verifyExactText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
  await t.expect(Selector(preferredDatePage.dayTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.monthTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.yearTextBox).value).notEql('');

  await preferredDatePage.goBack();
  await verifyExactText(chooseATestCentrePage.pageHeadingLocator, chooseATestCentrePage.pageHeading);
  await verifyExactText(chooseATestCentrePage.searchQueryValue, sessionData.testCentreSearch.searchQuery);

  await chooseATestCentrePage.goBack();
  await verifyExactText(findATheoryTestCentrePage.pageHeadingLocator, findATheoryTestCentrePage.pageHeading);
  await t.expect(Selector(findATheoryTestCentrePage.searchLocationTermTextBox).value).eql(sessionData.testCentreSearch.searchQuery);

  await findATheoryTestCentrePage.goBack();
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  await t.expect(Selector(testTypePage.getTestTypeSelector(TestType.ADIP1DVA)).checked).ok();

  await testTypePage.goBack();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
});
