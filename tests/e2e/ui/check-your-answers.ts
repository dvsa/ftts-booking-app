/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import {
  generalTitle,
  LANGUAGES, setRequestTimeout, TEST_TYPE,
} from '../data/constants';
import {
  verifyExactText, setCookie, verifyContainsText, link, verifyIsNotVisible, click, verifyIsVisible, capitalizeFirstLetter, verifyTitleContainsText,
} from '../utils/helpers';
import { CheckYourAnswersPage } from '../pages/check-your-answers-page';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import {
  LANGUAGE, LOCALE, TARGET, Voiceover,
} from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';

const checkYourAnswersPage = new CheckYourAnswersPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${checkYourAnswersPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Check your answers`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async (t) => {
    await setCookie(headerLogger, new SessionData(TARGET.GB));
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page UI contents are displayed correctly', async () => {
  const sessionData = new SessionData(TARGET.GB);
  await verifyTitleContainsText(`${checkYourAnswersPage.pageTitle} ${generalTitle}`);
  await verifyExactText(checkYourAnswersPage.pageTitleLocator, checkYourAnswersPage.pageHeading);

  await verifyExactText(checkYourAnswersPage.headingLocator, 'Personal details', 0);
  await verifyExactText(checkYourAnswersPage.personalDetailsKey, 'Name', 0);
  await verifyExactText(checkYourAnswersPage.personalDetailsKey, 'Date of birth', 1);
  await verifyExactText(checkYourAnswersPage.personalDetailsKey, 'Driving licence number', 2);
  await verifyExactText(checkYourAnswersPage.personalDetailsKey, 'Email address', 3);

  await verifyExactText(checkYourAnswersPage.headingLocator, 'Test details', 1);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'Test type', 0);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'Cost', 1);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'Test time and date', 2);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'Test location', 3);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'On-screen language', 4);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'Additional support', 5);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'British Sign Language', 6);
  await verifyExactText(checkYourAnswersPage.testDetailsKey, 'Voiceover language', 7);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Verify the Back link takes you to the choose appointment page', async () => {
  await checkYourAnswersPage.goBack();
  const chooseAppointmentPage = new ChooseAppointmentPage();
  await verifyTitleContainsText(`${chooseAppointmentPage.pageTitle} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageTitleLocator, chooseAppointmentPage.pageHeading);
});

test('Change email - the correct content is displayed', async (t) => {
  const sessionData = new SessionData(TARGET.GB);
  const contactDetailsPage = await checkYourAnswersPage.changeEmail();
  await verifyExactText(contactDetailsPage.pageTitleLocator, contactDetailsPage.pageHeading);
  await verifyIsNotVisible(contactDetailsPage.backLink);
  await verifyExactText(contactDetailsPage.updateEmailBanner, contactDetailsPage.updateEmailBannerText);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
  await verifyExactText(contactDetailsPage.continueButton, contactDetailsPage.updateEmailButtonText);
  await verifyExactText(contactDetailsPage.cancelButton, contactDetailsPage.cancelEmailButtonText);
});

test('Change email - cancel using the link in the banner, the original email is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const contactDetailsPage = await checkYourAnswersPage.changeEmail();
  await link(contactDetailsPage.cancelEmailLinkText);
  await verifyExactText(checkYourAnswersPage.personalDetailsValue, sessionData.candidate.email, 3);
});

test('Change email - cancel using the button at the bottom, the original email is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const contactDetailsPage = await checkYourAnswersPage.changeEmail();
  await link(contactDetailsPage.cancelEmailButtonText);
  await verifyExactText(checkYourAnswersPage.personalDetailsValue, sessionData.candidate.email, 3);
});

test('Change email - save and the updated email address is shown', async () => {
  const contactDetailsPage = await checkYourAnswersPage.changeEmail();
  const newEmail = 'updated-email@kainos.com';
  await contactDetailsPage.enterContactDetails(newEmail, newEmail);
  await verifyExactText(checkYourAnswersPage.personalDetailsValue, newEmail, 3);
});

test('Change test type - the correct content is displayed', async (t) => {
  const testTypePage = await checkYourAnswersPage.changeTestType();
  await verifyExactText(testTypePage.pageTitleLocator, testTypePage.pageHeading);
  await verifyIsNotVisible(testTypePage.backLink);
  await t.expect(Selector(capitalizeFirstLetter(testTypePage.testCategoryButtonCar)).checked).ok();

  await verifyContainsText(testTypePage.updateTestTypeBanner, testTypePage.updateTestTypeBannerText);
  await verifyExactText(testTypePage.warningIcon, '!');
  await verifyContainsText(testTypePage.warningMessageLocator, testTypePage.warningText);

  await verifyExactText(testTypePage.continueButton, testTypePage.updateTestTypeButtonText);
  await verifyExactText(testTypePage.cancelButton, testTypePage.cancelTestTypeButtonText);
});

test('Change test type - cancel using the link in the banner, the original test type is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const testTypePage = await checkYourAnswersPage.changeTestType();
  await link(testTypePage.cancelTestTypeLinkText);
  await verifyExactText(checkYourAnswersPage.testDetailsValue, capitalizeFirstLetter(sessionData.currentBooking.testType), 0);
});

test('Change test type - cancel using the button at the bottom, the original test type is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const testTypePage = await checkYourAnswersPage.changeTestType();
  await link(testTypePage.cancelTestTypeButtonText);
  await verifyExactText(checkYourAnswersPage.testDetailsValue, capitalizeFirstLetter(sessionData.currentBooking.testType), 0);
});

test('Change test type - save and we have to re-enter all other details', async (t) => {
  const sessionData = new SessionData(TARGET.GB);
  const testTypePage = await checkYourAnswersPage.changeTestType();
  sessionData.currentBooking.testType = TEST_TYPE.MOTORCYCLE;
  const languagePage = await testTypePage.selectTestCategoryGB(capitalizeFirstLetter(TEST_TYPE.MOTORCYCLE));

  await t.expect(Selector(languagePage.testLanguageOptionEnglish).checked).notOk();
  await t.expect(Selector(languagePage.testLanguageOptionWelsh).checked).notOk();
  const findTheoryTestCentrePage = await languagePage.selectTestLanguage(LANGUAGES.get(sessionData.currentBooking.language));

  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectATestCentre(sessionData.currentBooking.centre);

  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const chooseAppointmentPage = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change language - the correct content is displayed', async (t) => {
  const languagePage = await checkYourAnswersPage.changeTestLanguage();
  await verifyExactText(languagePage.pageTitleLocator, languagePage.pageHeading);
  await verifyIsNotVisible(languagePage.backLink);
  await t.expect(Selector(languagePage.testLanguageButtonEnglish).checked).ok();

  await verifyExactText(languagePage.updateLanguageBanner, languagePage.updateLanguageBannerText);
  await verifyExactText(languagePage.continueButton, languagePage.updateLanguageButtonText);
  await verifyExactText(languagePage.cancelButton, languagePage.cancelLanguageButtonText);
});

test('Change language - cancel using the link in the banner, the original language is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const languagePage = await checkYourAnswersPage.changeTestLanguage();
  await link(languagePage.cancelLanguageLinkText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change language - cancel using the button at the bottom, the original language is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const languagePage = await checkYourAnswersPage.changeTestLanguage();
  await link(languagePage.cancelLanguageButtonText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change language for GB - save and the updated language is shown', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const languagePage = await checkYourAnswersPage.changeTestLanguage();
  sessionData.currentBooking.language = LANGUAGE.WELSH;
  await languagePage.selectTestLanguage(LANGUAGES.get(LANGUAGE.WELSH));

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change language for NI - change button is hidden for a NI user', async () => {
  const sessionData = new SessionData(TARGET.NI, LOCALE.NI);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);
  await verifyTitleContainsText(`ni-${checkYourAnswersPage.pageTitle} ni${generalTitle}`);
  await verifyContainsText(checkYourAnswersPage.pageTitleLocator, checkYourAnswersPage.pageHeading);
  await verifyIsNotVisible(checkYourAnswersPage.changeTestLanguageLink);
});

test('Change time date location - What do you want to change page - the correct content is displayed', async (t) => {
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageTitle} ${generalTitle}`);
  await verifyExactText(whatDoYouWantToChangePage.pageTitleLocator, whatDoYouWantToChangePage.pageHeading);

  await verifyIsNotVisible(whatDoYouWantToChangePage.backLink);

  await verifyExactText(whatDoYouWantToChangePage.bannerTextLocator, whatDoYouWantToChangePage.bannerText);
  await verifyExactText(whatDoYouWantToChangePage.hintLocator, whatDoYouWantToChangePage.hintText);
  await verifyExactText(whatDoYouWantToChangePage.timeOnlyHintLocator, whatDoYouWantToChangePage.timeOnlyHintText);
  await verifyExactText(whatDoYouWantToChangePage.timeAndDateOnlyHintLocator, whatDoYouWantToChangePage.timeAndDateOnlyHintText);
  await verifyExactText(whatDoYouWantToChangePage.locationOnlyHintLocator, whatDoYouWantToChangePage.locationOnlyHintText);
  await verifyExactText(whatDoYouWantToChangePage.changeAndContinueButton, whatDoYouWantToChangePage.changeAndContinueButtonText);
  await verifyExactText(whatDoYouWantToChangePage.cancelAndKeepYourSelectionButton, whatDoYouWantToChangePage.cancelAndKeepYourSelectionButtonText);

  await t.expect(Selector(whatDoYouWantToChangePage.changeTimeOnlyOption).checked).notOk();
  await t.expect(Selector(whatDoYouWantToChangePage.changeTimeAndDateOption).checked).notOk();
  await t.expect(Selector(whatDoYouWantToChangePage.changeLocationOption).checked).notOk();
});

test('Change time date location - What do you want to change page - cancel using the link in the banner, the original time date location is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  await link(whatDoYouWantToChangePage.goBackAndKeepItLinkText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - What do you want to change page - cancel using the button at the bottom, the original time date location is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  await link(whatDoYouWantToChangePage.cancelAndKeepYourSelectionButtonText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - What do you want to change page - Verify the user is unable to proceed without selecting a test time date or location and an error message is displayed', async () => {
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  await click(whatDoYouWantToChangePage.changeAndContinueButton);
  await verifyExactText(whatDoYouWantToChangePage.errorMessageLocator, whatDoYouWantToChangePage.errorMessageHeader);
  await verifyExactText(whatDoYouWantToChangePage.errorMessageList, whatDoYouWantToChangePage.errorMessageText);
  await verifyContainsText(whatDoYouWantToChangePage.errorMessageRadioLocator, whatDoYouWantToChangePage.errorMessageText);

  await verifyTitleContainsText(`Error: ${whatDoYouWantToChangePage.pageTitle} ${generalTitle}`);
  await verifyIsVisible(whatDoYouWantToChangePage.errorLink);
  await whatDoYouWantToChangePage.clickErrorLink();
});

test('Change time date location - change time and verify the new time and old date and location is displayed', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot page and verify the banner text but later decide to keep the old time slot', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await verifyContainsText(chooseAppointmentPage.bannerLocator, chooseAppointmentPage.changeBannerText1);
  await verifyContainsText(chooseAppointmentPage.bannerLocator, chooseAppointmentPage.changeBannerText2);
  await link(chooseAppointmentPage.keepTheTimePreviouslySelectedText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot page but later decide to change location, date and time and verify location banner text in location page', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyContainsText(findTheoryTestCentrePage.bannerLocator, findTheoryTestCentrePage.changeBannerText);
  await verifyContainsText(findTheoryTestCentrePage.bannerLocator, findTheoryTestCentrePage.changeBannerWarningText);
  await verifyExactText(findTheoryTestCentrePage.cancelButton, findTheoryTestCentrePage.cancelButtonText);
  await verifyExactText(findTheoryTestCentrePage.findButton, findTheoryTestCentrePage.findButtonText);
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectANewTestCentre(sessionData.currentBooking.centre);
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const chooseAppointmentPageAgain = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPageAgain.chooseAppointment(sessionData.currentBooking);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot but later decide to change location but later decide to cancel using the top link', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  await findTheoryTestCentrePage.cancelUsingLink();

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot but later decide to change location but later decide to cancel using the bottom button', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  await findTheoryTestCentrePage.cancelUsingButton();

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot but later decide to change location but later to decide to keep the same test location from search results and verify the banner text in search results page', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  await verifyExactText(chooseTheoryTestCentrePage.bannerLocator, chooseTheoryTestCentrePage.bannerText);
  await chooseTheoryTestCentrePage.cancelUsingLink();

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change date and time and verify the banner text and new date and time and old location is displayed', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  await verifyContainsText(preferredDatePage.bannerLocator, preferredDatePage.changeBannerText);
  await verifyContainsText(preferredDatePage.bannerLocator, preferredDatePage.changeBannerWarningText);
  await verifyExactText(preferredDatePage.cancelButton, preferredDatePage.cancelButtonText);
  const chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit('16', '03', '2021');
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change date and time but later decide to keep the previous date and time by cancel using the top link and verify the old date, time, location is displayed', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await preferredDatePage.cancelUsingLink();

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change date and time but later decide to keep the previous date and time by cancel using the bottom button and verify the old date, time, location is displayed', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await preferredDatePage.cancelUsingButton();

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change location, date and time and verify the new location, date and time is displayed', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const whatDoYouWantToChangePage = await checkYourAnswersPage.changeTestTimeDateLocation();
  const findTheoryTestCentrePage = await whatDoYouWantToChangePage.selectLocationOnly();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectANewTestCentre(sessionData.currentBooking.centre);
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const chooseAppointmentPage = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change BSL - the correct content is displayed', async (t) => {
  const sessionData = new SessionData(TARGET.GB);
  const bslPage = await checkYourAnswersPage.changeBsl();
  await verifyExactText(bslPage.pageTitleLocator, bslPage.pageHeading);
  await verifyIsNotVisible(bslPage.backLink);
  const bslSelectedOption = bslPage.bslYesNo.replace('<>', YesOrNo.fromBoolean(sessionData.currentBooking.bsl).toString());
  await t.expect(Selector(bslSelectedOption).checked).ok();

  await verifyExactText(bslPage.updateBslBanner, bslPage.changeBannerText);
  await verifyExactText(bslPage.continueButton, bslPage.confirmChangeButtonText);
  await verifyExactText(bslPage.cancelButton, bslPage.cancelChangeButtonText);
});

test('Change BSL - cancel using the link in the banner, the original BSL option is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const bslPage = await checkYourAnswersPage.changeBsl();
  await link(bslPage.cancelChangeLinkBannerText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change BSL - cancel using the button at the bottom, the original BSL option is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const bslPage = await checkYourAnswersPage.changeBsl();
  await click(bslPage.cancelButton);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change BSL for GB - save and the updated BSL option is shown', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const bslPage = await checkYourAnswersPage.changeBsl();
  sessionData.currentBooking.bsl = true;
  await bslPage.selectBslRequired(sessionData.currentBooking.bsl);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover GB - the correct content is displayed', async (t) => {
  const sessionData = new SessionData(TARGET.GB);
  const voiceoverPage = await checkYourAnswersPage.changeVoiceover();
  await verifyExactText(voiceoverPage.pageTitleLocator, voiceoverPage.pageHeadingGB);
  await verifyIsNotVisible(voiceoverPage.backLink);
  const voiceoverSelector = voiceoverPage.voiceoverButton.replace('<>', sessionData.currentBooking.voiceover);
  await t.expect(Selector(voiceoverSelector).checked).ok();

  await verifyContainsText(voiceoverPage.updateLanguageBanner, voiceoverPage.updateBannerText);
  await verifyContainsText(voiceoverPage.updateLanguageBanner, voiceoverPage.cancelLinkText);
  await verifyExactText(voiceoverPage.continueButton, voiceoverPage.updateButtonText);
  await verifyExactText(voiceoverPage.cancelButton, voiceoverPage.cancelButtonText);
});

test('Change Voiceover NI - the correct content is displayed', async (t) => {
  const sessionData = new SessionData(TARGET.NI);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(`${pageUrl}?target=${TARGET.NI}&lang=${LOCALE.NI}`);

  const voiceoverPage = await checkYourAnswersPage.changeVoiceover();
  await verifyContainsText(voiceoverPage.pageTitleLocator, voiceoverPage.pageHeadingNI);
  await verifyIsNotVisible(voiceoverPage.backLink);
  const voiceoverSelector = voiceoverPage.voiceoverButton.replace('<>', sessionData.currentBooking.voiceover);
  await t.expect(Selector(voiceoverSelector).checked).ok();

  await verifyContainsText(voiceoverPage.updateLanguageBanner, voiceoverPage.updateBannerText);
  await verifyContainsText(voiceoverPage.updateLanguageBanner, voiceoverPage.cancelLinkText);
  await verifyContainsText(voiceoverPage.continueButton, voiceoverPage.updateButtonText);
  await verifyContainsText(voiceoverPage.cancelButton, voiceoverPage.cancelButtonText);
});

test('Change Voiceover - cancel using the link in the banner, the original Voiceover option is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const voiceoverPage = await checkYourAnswersPage.changeVoiceover();
  await link(voiceoverPage.cancelLinkText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover - cancel using the button at the bottom, the original Voiceover option is kept', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const voiceoverPage = await checkYourAnswersPage.changeVoiceover();
  await link(voiceoverPage.cancelButtonText);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover for GB - save and the updated Voiceover option is shown', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const voiceoverPage = await checkYourAnswersPage.changeVoiceover();
  sessionData.currentBooking.voiceover = Voiceover.WELSH;
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover for NI - save and the updated Voiceover option is shown', async () => {
  const sessionData = new SessionData(TARGET.NI);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);

  const voiceoverPage = await checkYourAnswersPage.changeVoiceover();
  sessionData.currentBooking.voiceover = Voiceover.CANTONESE;
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

  await checkYourAnswersPage.checkDataMatchesSession(sessionData);
});
