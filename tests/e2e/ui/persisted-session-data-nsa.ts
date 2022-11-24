/* eslint-disable security/detect-non-literal-regexp */
import { Selector } from 'testcafe';
import * as Constants from '../data/constants';
import { verifyContainsText, verifyExactText, verifyTitleContainsText } from '../utils/helpers';
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
  Locale, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import {
  generalTitle, generalTitleNI, setRequestTimeout, testPayment,
} from '../data/constants';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { CustomSupportPage } from '../pages/custom-support-page';
import { LeavingNsaPage } from '../pages/leaving-nsa-page';
import { NsaTelephoneContactPage } from '../pages/nsa-telephone-contact-page';
import { NsaVoicemailPage } from '../pages/nsa-voicemail-page';
import { NsaVoiceoverPage } from '../pages/nsa-voiceover-page';
import { PreferredDayNSAPage } from '../pages/preferred-day-nsa-page';
import { PreferredLocationNSAPage } from '../pages/preferred-location-nsa-page';
import { StayingNSAPage } from '../pages/staying-nsa-page';
import { TranslatorPage } from '../pages/translator-page';

const chooseAppointmentPage = new ChooseAppointmentPage();
const preferredDatePage = new PreferredDatePage();
const chooseATestCentrePage = new ChooseATestCentrePage();
const findATheoryTestCentrePage = new FindATheoryTestCentrePage();
const languagePage = new LanguagePage();
const testTypePage = new TestTypePage();
const contactDetailsPage = new ContactDetailsPage();
const selectSupportTypePage = new SelectSupportTypePage();
const voiceoverPage = new NsaVoiceoverPage();
const translatorPage = new TranslatorPage();
const customSupportPage = new CustomSupportPage();
const stayingNsaPage = new StayingNSAPage();
const leavingNsaPage = new LeavingNsaPage();
const preferredDayNSAPage = new PreferredDayNSAPage();
const preferredLocationNSAPage = new PreferredLocationNSAPage();
const telephoneContactPage = new NsaTelephoneContactPage();
const voicemailConsentPage = new NsaVoicemailPage();

fixture`Persisted session data - Non-standard accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await setRequestTimeout; })
  .meta('type', 'regression');

test('Non-Standard Accommodations GB - Verify that session data is persisted when using the back links - from start to check you details', async (t) => {
  // Setting only all support required in the session
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  // go through the booking journey until check your details
  const navigationHelper = new NavigationHelperNSA(sessionData);
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
  await t.expect(Selector(testTypePage.testCategoryButtonCar).checked).ok();
});

test('From Non-Standard moving to Standard Accommodations GB - Verify that session data is persisted when using the back links - from start to check you details', async (t) => {
  // Setting only voiceover so it becomes a standard journey
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.bsl = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
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
  await t.expect(Selector(testTypePage.testCategoryButtonCar).checked).ok();
});

test('Non-Standard Accommodations NI - Verify that session data is persisted when using the back links - from start to check you details', async (t) => {
  // Setting only all support required in the session
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.FARSI;

  // go through the booking journey until check your details
  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToTelephonePage();

  await verifyTitleContainsText(`${voicemailConsentPage.pageHeading} ${generalTitleNI}`);
  await voicemailConsentPage.goBack();

  await verifyTitleContainsText(`${telephoneContactPage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(telephoneContactPage.yesButton).checked).ok();
  await t.expect(Selector(telephoneContactPage.telephoneField).value).eql(sessionData.candidate.telephone.toString());
  await telephoneContactPage.goBack();

  await verifyTitleContainsText(`${contactDetailsPage.pageHeadingNSA} ${generalTitleNI}`);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
  await contactDetailsPage.goBack();

  await verifyTitleContainsText(`${preferredLocationNSAPage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(preferredLocationNSAPage.getRadioSelector(sessionData.currentBooking.preferredLocationOption)).checked).ok();
  await t.expect(Selector(preferredLocationNSAPage.preferredLocationTextArea).value).eql(sessionData.currentBooking.preferredLocation);
  await preferredLocationNSAPage.goBack();

  await verifyTitleContainsText(`${preferredDayNSAPage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(preferredDayNSAPage.getRadioSelector(sessionData.currentBooking.preferredDayOption)).checked).ok();
  await t.expect(Selector(preferredDayNSAPage.preferredDayTextArea).value).eql(sessionData.currentBooking.preferredDay);
  await preferredDayNSAPage.goBack();

  await verifyTitleContainsText(`${stayingNsaPage.pageHeadingEvidence} ${generalTitleNI}`);
  await stayingNsaPage.goBack();

  await verifyTitleContainsText(`${customSupportPage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(customSupportPage.supportTextArea).value).eql(sessionData.currentBooking.customSupport);
  await customSupportPage.goBack();

  // await verifyTitleContainsText(`${translatorPage.pageHeading} ${generalTitle}`); - no title currently
  await t.expect(Selector(translatorPage.translatorTextArea).value).eql(sessionData.currentBooking.translator);
  await customSupportPage.goBack();

  await verifyTitleContainsText(`${voiceoverPage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(voiceoverPage.getRadioSelector(sessionData.currentBooking.voiceover)).checked).ok();
  await voiceoverPage.goBack();

  await verifyTitleContainsText(`${selectSupportTypePage.pageHeading} ${generalTitleNI}`);
  const supportTypes = sessionData.currentBooking.selectSupportType;
  for (let index = 0; index < supportTypes.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await t.expect(
      Selector(selectSupportTypePage.getOptionSelector(supportTypes[index])).checked,
    ).ok();
  }
  await selectSupportTypePage.goBack();

  await verifyContainsText(testTypePage.pageHeadingLocator, testTypePage.pageHeadingNSA);
  await t.expect(Selector(testTypePage.testCategoryButtonCar).checked).ok();
});

test('From Non-Standard moving to Standard Accommodations NI - Verify that session data is persisted when using the back links - from start to check you details', async (t) => {
  // Setting only voiceover so it becomes a standard journey
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.bsl = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.TURKISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Belfast';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.navigateToChooseAppointmentPage();
  await chooseAppointmentPage.goBack();

  await verifyTitleContainsText(`${preferredDatePage.pageHeading} ${generalTitleNI}`);
  await verifyContainsText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
  await t.expect(Selector(preferredDatePage.dayTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.monthTextBox).value).notEql('');
  await t.expect(Selector(preferredDatePage.yearTextBox).value).notEql('');
  await preferredDatePage.goBack();

  await verifyTitleContainsText(`${chooseATestCentrePage.pageHeading} ${generalTitleNI}`);
  await verifyExactText(chooseATestCentrePage.searchQueryValue, sessionData.testCentreSearch.searchQuery);
  await chooseATestCentrePage.goBack();

  await verifyTitleContainsText(`${findATheoryTestCentrePage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(findATheoryTestCentrePage.searchLocationTermTextBox).value).eql(sessionData.testCentreSearch.searchQuery);
  await findATheoryTestCentrePage.goBack();

  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
  await contactDetailsPage.goBack();

  await verifyTitleContainsText(`${leavingNsaPage.pageHeading} ${generalTitleNI}`);
  await leavingNsaPage.goBack();

  await verifyTitleContainsText(`${voiceoverPage.pageHeading} ${generalTitleNI}`);
  await t.expect(Selector(voiceoverPage.getRadioSelector(sessionData.currentBooking.voiceover)).checked).ok();
  await voiceoverPage.goBack();

  await verifyTitleContainsText(`${selectSupportTypePage.pageHeading} ${generalTitleNI}`);
  const supportTypes = sessionData.currentBooking.selectSupportType;
  for (let index = 0; index < supportTypes.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await t.expect(
      Selector(selectSupportTypePage.getOptionSelector(supportTypes[index])).checked,
    ).ok();
  }
  await selectSupportTypePage.goBack();

  await verifyContainsText(testTypePage.pageHeadingLocator, testTypePage.pageHeadingNSA);
  await t.expect(Selector(testTypePage.testCategoryButtonCar).checked).ok();
});
