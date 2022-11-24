/* eslint-disable security/detect-non-literal-regexp */
import { Selector } from 'testcafe';
import * as Constants from '../data/constants';
import { verifyExactText, verifyTitleContainsText } from '../utils/helpers';
import { NavigationHelper } from '../utils/navigation-helper';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { ChooseATestCentrePage } from '../pages/choose-a-test-centre-page';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { LanguagePage } from '../pages/language-page';
import { TestTypePage } from '../pages/test-type-page';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { SessionData } from '../data/session-data';
import {
  Locale, SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { generalTitle, setRequestTimeout, testPayment } from '../data/constants';
import { NavigationHelperInstructorNSA } from '../utils/navigation-helper-instructor-nsa';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { CustomSupportPage } from '../pages/custom-support-page';
import { LeavingNsaPage } from '../pages/leaving-nsa-page';
import { NsaTelephoneContactPage } from '../pages/nsa-telephone-contact-page';
import { NsaVoicemailPage } from '../pages/nsa-voicemail-page';
import { NsaVoiceoverPage } from '../pages/nsa-voiceover-page';
import { PreferredDayNSAPage } from '../pages/preferred-day-nsa-page';
import { PreferredLocationNSAPage } from '../pages/preferred-location-nsa-page';
import { StayingNSAPage } from '../pages/staying-nsa-page';

const chooseAppointmentPage = new ChooseAppointmentPage();
const preferredDatePage = new PreferredDatePage();
const chooseATestCentrePage = new ChooseATestCentrePage();
const findATheoryTestCentrePage = new FindATheoryTestCentrePage();
const languagePage = new LanguagePage();
const testTypePage = new TestTypePage();
const contactDetailsPage = new ContactDetailsPage();
const selectSupportTypePage = new SelectSupportTypePage();
const voiceoverPage = new NsaVoiceoverPage();
const customSupportPage = new CustomSupportPage();
const stayingNsaPage = new StayingNSAPage();
const leavingNsaPage = new LeavingNsaPage();
const preferredDayNSAPage = new PreferredDayNSAPage();
const preferredLocationNSAPage = new PreferredLocationNSAPage();
const telephoneContactPage = new NsaTelephoneContactPage();
const voicemailConsentPage = new NsaVoicemailPage();

fixture`Instructor - Persisted session data - Non-standard accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await setRequestTimeout; })
  .meta('type', 'instructor');

test('Non-Standard Accommodations GB - Verify that session data is persisted when using the back links - from start to check you details', async (t) => {
  // Setting only all support required in the session
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  // go through the booking journey until check your details
  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.navigateToTelephonePage();

  await verifyTitleContainsText(`${voicemailConsentPage.pageHeading} ${generalTitle}`);
  await voicemailConsentPage.goBack();

  await verifyTitleContainsText(`${telephoneContactPage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(telephoneContactPage.yesButton).checked).ok();
  await t.expect(Selector(telephoneContactPage.telephoneField).value).eql(sessionData.candidate.telephone.toString());
  await telephoneContactPage.goBack();

  await verifyTitleContainsText(`${contactDetailsPage.pageHeadingNSA} ${generalTitle}`);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
  await contactDetailsPage.goBack();

  await verifyTitleContainsText(`${preferredLocationNSAPage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(preferredLocationNSAPage.getRadioSelector(sessionData.currentBooking.preferredLocationOption)).checked).ok();
  await t.expect(Selector(preferredLocationNSAPage.preferredLocationTextArea).value).eql(sessionData.currentBooking.preferredLocation);
  await preferredLocationNSAPage.goBack();

  await verifyTitleContainsText(`${preferredDayNSAPage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(preferredDayNSAPage.getRadioSelector(sessionData.currentBooking.preferredDayOption)).checked).ok();
  await t.expect(Selector(preferredDayNSAPage.preferredDayTextArea).value).eql(sessionData.currentBooking.preferredDay);
  await preferredDayNSAPage.goBack();

  await verifyTitleContainsText(`${stayingNsaPage.pageHeadingEvidence} ${generalTitle}`);
  await stayingNsaPage.goBack();

  await verifyTitleContainsText(`${customSupportPage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(customSupportPage.supportTextArea).value).eql(sessionData.currentBooking.customSupport);
  await customSupportPage.goBack();

  await verifyTitleContainsText(`${voiceoverPage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(voiceoverPage.getRadioSelector(sessionData.currentBooking.voiceover)).checked).ok();
  await voiceoverPage.goBack();

  await verifyTitleContainsText(`${selectSupportTypePage.pageHeading} ${generalTitle}`);
  const supportTypes = sessionData.currentBooking.selectSupportType;
  for (let index = 0; index < supportTypes.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await t.expect(
      Selector(selectSupportTypePage.getOptionSelector(supportTypes[index])).checked,
    ).ok();
  }
  await selectSupportTypePage.goBack();

  await verifyExactText(languagePage.pageHeadingLocator, languagePage.pageHeading);
  await t.expect(Selector(languagePage.testLanguageButtonEnglish).checked).ok();
  await languagePage.goBack();

  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeadingNSA);
  await t.expect(Selector(testTypePage.getTestTypeSelector(TestType.ADIP1)).checked).ok();
});

test('From Non-Standard moving to Standard Accommodations GB - Verify that session data is persisted when using the back links - from start to check you details', async (t) => {
  // Setting only voiceover so it becomes a standard journey
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.bsl = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.navigateToChooseAppointmentPage();
  await chooseAppointmentPage.goBack();

  await verifyTitleContainsText(`${preferredDatePage.pageHeading} ${generalTitle}`);
  await verifyExactText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
  await t.expect(Selector(preferredDatePage.dayTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.monthTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.yearTextBox).value).notEql('');
  await preferredDatePage.goBack();

  await verifyTitleContainsText(`${chooseATestCentrePage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseATestCentrePage.searchQueryValue, sessionData.testCentreSearch.searchQuery);
  await chooseATestCentrePage.goBack();

  await verifyTitleContainsText(`${findATheoryTestCentrePage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(findATheoryTestCentrePage.searchLocationTermTextBox).value).eql(sessionData.testCentreSearch.searchQuery);
  await findATheoryTestCentrePage.goBack();

  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
  await contactDetailsPage.goBack();

  await verifyTitleContainsText(`${leavingNsaPage.pageHeading} ${generalTitle}`);
  await leavingNsaPage.goBack();

  await verifyTitleContainsText(`${voiceoverPage.pageHeading} ${generalTitle}`);
  await t.expect(Selector(voiceoverPage.getRadioSelector(sessionData.currentBooking.voiceover)).checked).ok();
  await voiceoverPage.goBack();

  await verifyTitleContainsText(`${selectSupportTypePage.pageHeading} ${generalTitle}`);
  const supportTypes = sessionData.currentBooking.selectSupportType;
  for (let index = 0; index < supportTypes.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await t.expect(
      Selector(selectSupportTypePage.getOptionSelector(supportTypes[index])).checked,
    ).ok();
  }
  await selectSupportTypePage.goBack();

  await verifyExactText(languagePage.pageHeadingLocator, languagePage.pageHeading);
  await t.expect(Selector(languagePage.testLanguageButtonEnglish).checked).ok();
  await languagePage.goBack();

  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeadingNSA);
  await t.expect(Selector(testTypePage.getTestTypeSelector(TestType.ADIP1)).checked).ok();
});
