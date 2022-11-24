/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector } from 'testcafe';
import {
  generalTitle, Languages, setRequestTimeout,
} from '../data/constants';
import {
  verifyExactText, setCookie, verifyContainsText, link, verifyIsNotVisible, click, verifyIsVisible, verifyTitleContainsText, getFutureDate,
} from '../utils/helpers';
import { CheckYourDetailsPage } from '../pages/check-your-details-page';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import {
  Language, Locale, Target, Voiceover,
} from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { createCandidateAndLicence } from '../utils/crm/crm-data-helper';

const checkYourDetailsPage = new CheckYourDetailsPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/instructor/${checkYourDetailsPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Instructor - Check your details - Standard Accommodations `
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async (t) => {
    const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
    await createCandidateAndLicence(sessionData);
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
    t.ctx.sessionData = sessionData;
  })
  .meta('type', 'instructor');

test('Verify page UI contents are displayed correctly', async (t) => {
  const { sessionData } = t.ctx;
  await verifyTitleContainsText(`${checkYourDetailsPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(checkYourDetailsPage.pageHeadingLocator, checkYourDetailsPage.pageHeading);

  await verifyExactText(checkYourDetailsPage.personalDetailsHeadingLocator, 'Personal details');
  await verifyExactText(checkYourDetailsPage.personalDetailsKey, 'Name', 0);
  await verifyExactText(checkYourDetailsPage.personalDetailsKey, 'Date of birth', 1);
  await verifyExactText(checkYourDetailsPage.personalDetailsKey, 'Driving licence number', 2);
  await verifyExactText(checkYourDetailsPage.personalDetailsKey, 'Email address', 3);

  await verifyExactText(checkYourDetailsPage.testDetailsHeadingLocator, 'Test details');
  await verifyExactText(checkYourDetailsPage.testDetailsKey, 'Test type', 0);
  await verifyExactText(checkYourDetailsPage.testDetailsKey, 'Cost', 1);
  await verifyExactText(checkYourDetailsPage.testDetailsKey, 'Test time and date', 2);
  await verifyExactText(checkYourDetailsPage.testDetailsKey, 'Test location', 3);
  await verifyExactText(checkYourDetailsPage.testDetailsKey, 'On-screen language', 4);
  await verifyExactText(checkYourDetailsPage.testDetailsKey, 'Support requested', 5);
  await verifyExactText(checkYourDetailsPage.testDetailsKey, 'Voiceover language', 6);

  await verifyContainsText(checkYourDetailsPage.paymentAlertMessageLocator, checkYourDetailsPage.paymentAlertMessage);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Verify the Back link takes you to the choose appointment page', async () => {
  await checkYourDetailsPage.goBack();
  const chooseAppointmentPage = new ChooseAppointmentPage();
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
});

test('Change email - the correct content is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const contactDetailsPage = await checkYourDetailsPage.changeEmail();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
  await verifyIsNotVisible(contactDetailsPage.backLink);
  await verifyExactText(contactDetailsPage.updateEmailBanner, contactDetailsPage.updateEmailBannerText);
  await t.expect(Selector(contactDetailsPage.emailAddressTextBox).value).eql(sessionData.candidate.email);
  await t.expect(Selector(contactDetailsPage.confirmEmailAddressTextBox).value).eql(sessionData.candidate.email);
  await verifyExactText(contactDetailsPage.continueButton, contactDetailsPage.updateEmailButtonText);
  await verifyExactText(contactDetailsPage.cancelButton, contactDetailsPage.cancelEmailButtonText);
});

test('Change email - cancel using the link in the banner, the original email is kept', async (t) => {
  const { sessionData } = t.ctx;
  const contactDetailsPage = await checkYourDetailsPage.changeEmail();
  await link(contactDetailsPage.cancelEmailLinkText);
  await verifyExactText(checkYourDetailsPage.personalDetailsValue, sessionData.candidate.email, 3);
});

test('Change email - cancel using the button at the bottom, the original email is kept', async (t) => {
  const { sessionData } = t.ctx;
  const contactDetailsPage = await checkYourDetailsPage.changeEmail();
  await link(contactDetailsPage.cancelEmailButtonText);
  await verifyExactText(checkYourDetailsPage.personalDetailsValue, sessionData.candidate.email, 3);
});

test('Change email - save and the updated email address is shown', async () => {
  const contactDetailsPage = await checkYourDetailsPage.changeEmail();
  const newEmail = 'updated-email@kainos.com';
  await contactDetailsPage.enterContactDetails(newEmail, newEmail);
  await verifyExactText(checkYourDetailsPage.personalDetailsValue, newEmail, 3);
});

test('Change language - the correct content is displayed', async (t) => {
  const languagePage = await checkYourDetailsPage.changeTestLanguage();
  await verifyExactText(languagePage.pageHeadingLocator, languagePage.pageHeading);
  await verifyIsNotVisible(languagePage.backLink);
  await t.expect(Selector(languagePage.testLanguageButtonEnglish).checked).ok();

  await verifyExactText(languagePage.updateLanguageBanner, languagePage.updateLanguageBannerText);
  await verifyExactText(languagePage.continueButton, languagePage.updateLanguageButtonText);
  await verifyExactText(languagePage.cancelButton, languagePage.cancelLanguageButtonText);
});

test('Change language - cancel using the link in the banner, the original language is kept', async (t) => {
  const { sessionData } = t.ctx;
  const languagePage = await checkYourDetailsPage.changeTestLanguage();
  await link(languagePage.cancelLanguageLinkText);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change language - cancel using the button at the bottom, the original language is kept', async (t) => {
  const { sessionData } = t.ctx;
  const languagePage = await checkYourDetailsPage.changeTestLanguage();
  await link(languagePage.cancelLanguageButtonText);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change language for GB - save and the updated language is shown', async (t) => {
  const { sessionData } = t.ctx;
  const languagePage = await checkYourDetailsPage.changeTestLanguage();
  sessionData.currentBooking.language = Language.WELSH;
  await languagePage.selectTestLanguage(Languages.get(Language.WELSH));

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - What do you want to change page - the correct content is displayed', async (t) => {
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageHeading} ${generalTitle}`);
  await verifyExactText(whatDoYouWantToChangePage.pageHeadingLocator, whatDoYouWantToChangePage.pageHeading);

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

test('Change time date location - What do you want to change page - cancel using the link in the banner, the original time date location is kept', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  await link(whatDoYouWantToChangePage.goBackAndKeepItLinkText);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - What do you want to change page - cancel using the button at the bottom, the original time date location is kept', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  await link(whatDoYouWantToChangePage.cancelAndKeepYourSelectionButtonText);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - What do you want to change page - Verify the user is unable to proceed without selecting a test time date or location and an error message is displayed', async () => {
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  await click(whatDoYouWantToChangePage.changeAndContinueButton);
  await verifyExactText(whatDoYouWantToChangePage.errorMessageLocator, whatDoYouWantToChangePage.errorMessageHeader);
  await verifyExactText(whatDoYouWantToChangePage.errorMessageList, whatDoYouWantToChangePage.errorMessageText);
  await verifyContainsText(whatDoYouWantToChangePage.errorMessageRadioLocator, whatDoYouWantToChangePage.errorMessageText);

  await verifyTitleContainsText('Error');
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageHeading} ${generalTitle}`);
  await verifyIsVisible(whatDoYouWantToChangePage.errorLink);
  await whatDoYouWantToChangePage.clickErrorLink();
});

test('Change time date location - change time and verify the new time and old date and location is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot page and verify the banner text but later decide to keep the old time slot', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await verifyContainsText(chooseAppointmentPage.bannerLocator, chooseAppointmentPage.changeBannerText1);
  await verifyContainsText(chooseAppointmentPage.bannerLocator, chooseAppointmentPage.changeBannerText2);
  await link(chooseAppointmentPage.keepTheTimePreviouslySelectedText);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot page but later decide to change location, date and time and verify location banner text in location page', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
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

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot but later decide to change location but later decide to cancel using the top link', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  await findTheoryTestCentrePage.cancelUsingLink();

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot but later decide to change location but later decide to cancel using the bottom button', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  await findTheoryTestCentrePage.cancelUsingButton();

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - go to change the time slot but later decide to change location but later to decide to keep the same test location from search results and verify the banner text in search results page', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  await verifyTitleContainsText(chooseTheoryTestCentrePage.pageHeading);
  await verifyExactText(chooseTheoryTestCentrePage.bannerLocator, chooseTheoryTestCentrePage.bannerText);
  await chooseTheoryTestCentrePage.cancelUsingLink();

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change date and time and verify the banner text and new date and time and old location is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  await verifyContainsText(preferredDatePage.bannerLocator, preferredDatePage.changeBannerText);
  await verifyContainsText(preferredDatePage.bannerLocator, preferredDatePage.changeBannerWarningText);
  await verifyExactText(preferredDatePage.cancelButton, preferredDatePage.cancelButtonText);
  const testDate = preferredDatePage.adjustForDaysWithNoSlots(getFutureDate('month', 4));
  const chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit(testDate.date().toString(), (testDate.month() + 1).toString(), testDate.year().toString());
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change date and time but later decide to keep the previous date and time by cancel using the top link and verify the old date, time, location is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await preferredDatePage.cancelUsingLink();

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change date and time but later decide to keep the previous date and time by cancel using the bottom button and verify the old date, time, location is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await preferredDatePage.cancelUsingButton();

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change time date location - change location, date and time and verify the new location, date and time is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const whatDoYouWantToChangePage = await checkYourDetailsPage.changeTestTimeDateLocation();
  const findTheoryTestCentrePage = await whatDoYouWantToChangePage.selectLocationOnly();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectANewTestCentre(sessionData.currentBooking.centre);
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const chooseAppointmentPage = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover GB - the correct content is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const voiceoverPage = await checkYourDetailsPage.changeVoiceover();
  await verifyExactText(voiceoverPage.pageHeadingLocator, voiceoverPage.pageHeading);
  await verifyIsNotVisible(voiceoverPage.backLink);
  const voiceoverSelector = voiceoverPage.voiceoverButton.replace('<>', sessionData.currentBooking.voiceover);
  await t.expect(Selector(voiceoverSelector).checked).ok();

  await verifyContainsText(voiceoverPage.updateLanguageBanner, voiceoverPage.updateBannerText);
  await verifyContainsText(voiceoverPage.updateLanguageBanner, voiceoverPage.cancelLinkText);
  await verifyExactText(voiceoverPage.continueButton, voiceoverPage.updateButtonText);
  await verifyExactText(voiceoverPage.cancelButton, voiceoverPage.cancelButtonText);
});

test('Change Voiceover - cancel using the link in the banner, the original Voiceover option is kept', async (t) => {
  const { sessionData } = t.ctx;
  const voiceoverPage = await checkYourDetailsPage.changeVoiceover();
  await link(voiceoverPage.cancelLinkText);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover - cancel using the button at the bottom, the original Voiceover option is kept', async (t) => {
  const { sessionData } = t.ctx;
  const voiceoverPage = await checkYourDetailsPage.changeVoiceover();
  await link(voiceoverPage.cancelButtonText);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover for GB - save and the updated Voiceover option is shown', async (t) => {
  const { sessionData } = t.ctx;
  const voiceoverPage = await checkYourDetailsPage.changeVoiceover();
  sessionData.currentBooking.voiceover = Voiceover.WELSH;
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

  await checkYourDetailsPage.checkDataMatchesSession(sessionData);
});
