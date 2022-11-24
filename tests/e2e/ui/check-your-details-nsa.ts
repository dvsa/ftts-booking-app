/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import {
  generalTitle,
  Languages,
  setRequestTimeout,
  testPayment,
  TestTypeName,
} from '../data/constants';
import {
  verifyExactText, setCookie, verifyContainsText, verifyIsNotVisible, verifyTitleContainsText, link, verifyIsVisible,
} from '../utils/helpers';
import { CheckYourDetailsNsaPage } from '../pages/check-your-details-nsa-page';
import {
  Language,
  Locale, SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { NavigationHelper } from '../utils/navigation-helper';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { createCandidateAndLicence } from '../utils/crm/crm-data-helper';

const checkYourDetailsNsaPage = new CheckYourDetailsNsaPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${checkYourDetailsNsaPage.pathUrl}`;
const pageUrlGB = `${pageUrl}?target=${Target.GB}`;
const pageUrlNI = `${pageUrl}?target=${Target.NI}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Check your details - Non-Standard Accommodations`
  .page(`${process.env.BOOKING_APP_URL}?target=${Target.GB}`)
  .requestHooks(headerLogger)
  .before(async () => { await setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page UI contents are displayed correctly - GB', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);
  await verifyTitleContainsText(`${checkYourDetailsNsaPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(checkYourDetailsNsaPage.pageHeadingLocator, checkYourDetailsNsaPage.pageHeading);

  await verifyExactText(checkYourDetailsNsaPage.personalDetailsHeadingLocator, 'Personal details');
  await verifyExactText(checkYourDetailsNsaPage.personalDetailsKey, 'Name', 0);
  await verifyExactText(checkYourDetailsNsaPage.personalDetailsKey, 'Date of birth', 1);
  await verifyExactText(checkYourDetailsNsaPage.personalDetailsKey, 'Driving licence number', 2);
  await verifyExactText(checkYourDetailsNsaPage.personalDetailsKey, 'Telephone', 3);
  await verifyExactText(checkYourDetailsNsaPage.personalDetailsKey, 'Email address', 4);
  await verifyExactText(checkYourDetailsNsaPage.personalDetailsKey, 'Consent to leave you phone messages', 5);

  await verifyExactText(checkYourDetailsNsaPage.testDetailsHeadingLocator, 'Test details');
  await verifyExactText(checkYourDetailsNsaPage.testDetailsKey, 'Test type', 0);
  await verifyExactText(checkYourDetailsNsaPage.testDetailsKey, 'On-screen language', 1);

  await verifyExactText(checkYourDetailsNsaPage.supportDetailsHeadingLocator, 'Support Details');
  await verifyExactText(checkYourDetailsNsaPage.supportDetailsKey, 'Support requested', 0);
  await verifyExactText(checkYourDetailsNsaPage.supportDetailsKey, 'Support types you selected', 1);
  await verifyExactText(checkYourDetailsNsaPage.supportDetailsKey, 'Voiceover language', 2);
  await verifyExactText(checkYourDetailsNsaPage.supportDetailsKey, 'Support details you added', 3);
  await verifyExactText(checkYourDetailsNsaPage.supportDetailsKey, 'Preferred time for test', 4);
  await verifyExactText(checkYourDetailsNsaPage.supportDetailsKey, 'Preferred locations for test', 5);

  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Verify page UI contents are displayed correctly - NI', async () => {
  const sessionDataNSA = new SessionData(Target.NI, Locale.NI, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlNI);

  await verifyContainsText(checkYourDetailsNsaPage.pageHeadingLocator, checkYourDetailsNsaPage.pageHeading);

  await verifyContainsText(checkYourDetailsNsaPage.personalDetailsHeadingLocator, 'Personal details');
  await verifyContainsText(checkYourDetailsNsaPage.personalDetailsKey, 'Name', 0);
  await verifyContainsText(checkYourDetailsNsaPage.personalDetailsKey, 'Date of birth', 1);
  await verifyContainsText(checkYourDetailsNsaPage.personalDetailsKey, 'Driving licence number', 2);
  await verifyContainsText(checkYourDetailsNsaPage.personalDetailsKey, 'Telephone', 3);
  await verifyContainsText(checkYourDetailsNsaPage.personalDetailsKey, 'Email address', 4);
  await verifyContainsText(checkYourDetailsNsaPage.personalDetailsKey, 'Consent to leave you phone messages', 5);

  await verifyContainsText(checkYourDetailsNsaPage.testDetailsHeadingLocator, 'Test details');
  await verifyContainsText(checkYourDetailsNsaPage.testDetailsKey, 'Test type', 0);
  await verifyContainsText(checkYourDetailsNsaPage.testDetailsKey, 'On-screen language', 1);
  await verifyIsNotVisible(checkYourDetailsNsaPage.changeOnscreenLanguageLink);

  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsHeadingLocator, 'Support Details');
  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsKey, 'Support requested', 0);
  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsKey, 'Support types you selected', 1);
  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsKey, 'Voiceover language', 2);
  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsKey, 'Translator language', 3);
  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsKey, 'Support details you added', 4);
  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsKey, 'Preferred time for test', 5);
  await verifyContainsText(checkYourDetailsNsaPage.supportDetailsKey, 'Preferred locations for test', 6);

  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Support Requested for GB from yes to no - save and the updated option is shown', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await createCandidateAndLicence(sessionData);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const supportRequestedPage = await checkYourDetailsNsaPage.changeSupportRequested();
  sessionData.journey.support = false;
  await supportRequestedPage.selectSupportRequired(sessionData.journey.support);

  sessionData.changeSupport = true;
  sessionData.hasComeFromNsaJourney = false;
  sessionData.currentBooking.testType = TestType.CAR;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.currentBooking.voiceover = Voiceover.NONE;
  sessionData.testCentreSearch.searchQuery = 'Birmingham';
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelper = new NavigationHelper(sessionData);
  await navigationHelper.navigateToCheckBookingPage();
});

test('Change Voiceover - the correct content is displayed', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const voiceoverPage = await checkYourDetailsNsaPage.changeVoiceover();
  await verifyExactText(voiceoverPage.pageHeadingLocator, voiceoverPage.pageHeading);
  await verifyIsNotVisible(voiceoverPage.backLink);
  await verifyContainsText(voiceoverPage.updateBanner, voiceoverPage.updateBannerText);
  await verifyContainsText(voiceoverPage.updateBanner, voiceoverPage.cancelLinkText);
  await t.expect(Selector(voiceoverPage.getRadioSelector(sessionData.currentBooking.voiceover)).checked).ok();
  await verifyExactText(voiceoverPage.continueButton, voiceoverPage.updateButtonText);
  await verifyExactText(voiceoverPage.cancelButton, voiceoverPage.cancelButtonText);
});

test('Change Voiceover - cancel using the link in the banner, the original voiceover option is kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const voiceoverPage = await checkYourDetailsNsaPage.changeVoiceover();
  await link(voiceoverPage.cancelLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover - cancel using the button at the bottom, the original voiceover option is kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const voiceoverPage = await checkYourDetailsNsaPage.changeVoiceover();
  await link(voiceoverPage.cancelButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Voiceover - save and the new voiceover option is shown', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const voiceoverPage = await checkYourDetailsNsaPage.changeVoiceover();
  sessionData.currentBooking.voiceover = Voiceover.WELSH;
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Translator (NI only) - the correct content is displayed', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlNI);

  const translatorPage = await checkYourDetailsNsaPage.changeTranslatorLanguage();
  await verifyContainsText(translatorPage.pageHeadingLocator, translatorPage.pageHeading);
  await verifyIsNotVisible(translatorPage.backLink);
  await verifyContainsText(translatorPage.updateBanner, translatorPage.updateBannerText);
  await t.expect(Selector(translatorPage.translatorTextArea).value).eql(sessionData.currentBooking.translator);
  await verifyContainsText(translatorPage.continueButton, translatorPage.updateButtonText);
  await verifyContainsText(translatorPage.cancelButton, translatorPage.cancelButtonText);
});

test('Change Translator (NI only) - cancel using the link in the banner, the original translator details are kept', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlNI);

  const translatorPage = await checkYourDetailsNsaPage.changeTranslatorLanguage();
  await link(translatorPage.cancelLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Translator (NI only) - cancel using the button at the bottom, the original translator details are kept', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlNI);

  const translatorPage = await checkYourDetailsNsaPage.changeTranslatorLanguage();
  await link(translatorPage.cancelButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Translator (NI only) - save and the new translator details are shown', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlNI);

  const translatorPage = await checkYourDetailsNsaPage.changeTranslatorLanguage();
  sessionData.currentBooking.translator = 'Russian please';
  await translatorPage.enterTranslatorDetails(sessionData.currentBooking.translator);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Custom suppport - the correct content is displayed', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const customSupportPage = await checkYourDetailsNsaPage.changeOtherSupport();
  await verifyExactText(customSupportPage.pageHeadingLocator, customSupportPage.pageHeading);
  await verifyIsNotVisible(customSupportPage.backLink);
  await verifyExactText(customSupportPage.updateBanner, customSupportPage.updateBannerText);
  await t.expect(Selector(customSupportPage.supportTextArea).value).eql(sessionData.currentBooking.customSupport);
  await verifyExactText(customSupportPage.continueButton, customSupportPage.updateButtonText);
  await verifyExactText(customSupportPage.cancelButton, customSupportPage.cancelButtonText);
});

test('Change Custom suppport - cancel using the link in the banner, the original custom support details are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const customSupportPage = await checkYourDetailsNsaPage.changeOtherSupport();
  await link(customSupportPage.cancelLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Custom suppport - cancel using the button at the bottom, the original custom support details are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const customSupportPage = await checkYourDetailsNsaPage.changeOtherSupport();
  await link(customSupportPage.cancelButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Custom suppport - save and the new custom support details are shown', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const customSupportPage = await checkYourDetailsNsaPage.changeOtherSupport();
  sessionData.currentBooking.customSupport = 'My new support requirements are...';
  await customSupportPage.enterSupportInformation(sessionData.currentBooking.customSupport);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Preferred day - the correct content is displayed', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredDayPage = await checkYourDetailsNsaPage.changePreferredDay();
  await verifyExactText(preferredDayPage.pageHeadingLocator, preferredDayPage.pageHeading);
  await verifyIsNotVisible(preferredDayPage.backLink);
  await verifyExactText(preferredDayPage.updateBanner, preferredDayPage.updateBannerText);
  await t.expect(Selector(preferredDayPage.preferredDayTextArea).value).eql(sessionData.currentBooking.preferredDay);
  await verifyExactText(preferredDayPage.continueButton, preferredDayPage.updateButtonText);
  await verifyExactText(preferredDayPage.cancelButton, preferredDayPage.cancelButtonText);
});

test('Change Preferred day - cancel using the link in the banner, the original preferred day details are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredDayPage = await checkYourDetailsNsaPage.changePreferredDay();
  await link(preferredDayPage.cancelLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Preferred day - cancel using the button at the bottom, the original preferred day details are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredDayPage = await checkYourDetailsNsaPage.changePreferredDay();
  await link(preferredDayPage.cancelButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Preferred day - save and the new preferred day details are shown', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredDayPage = await checkYourDetailsNsaPage.changePreferredDay();
  sessionData.currentBooking.preferredDay = 'I can only do Saturdays now';
  await preferredDayPage.enterPreferredDayInformation(sessionData.currentBooking.preferredDay);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Preferred location - the correct content is displayed', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredLocationPage = await checkYourDetailsNsaPage.changePreferredLocation();
  await verifyExactText(preferredLocationPage.pageHeadingLocator, preferredLocationPage.pageHeading);
  await verifyIsNotVisible(preferredLocationPage.backLink);
  await verifyExactText(preferredLocationPage.updateBanner, preferredLocationPage.updateBannerText);
  await t.expect(Selector(preferredLocationPage.preferredLocationTextArea).value).eql(sessionData.currentBooking.preferredLocation);
  await verifyExactText(preferredLocationPage.continueButton, preferredLocationPage.updateButtonText);
  await verifyExactText(preferredLocationPage.cancelButton, preferredLocationPage.cancelButtonText);
});

test('Change Preferred location - cancel using the link in the banner, the original preferred location details are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredLocationPage = await checkYourDetailsNsaPage.changePreferredLocation();
  await link(preferredLocationPage.cancelLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Preferred location - cancel using the button at the bottom, the original preferred location details are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredLocationPage = await checkYourDetailsNsaPage.changePreferredLocation();
  await link(preferredLocationPage.cancelButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Preferred location - save and the new preferred location details are shown', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const preferredLocationPage = await checkYourDetailsNsaPage.changePreferredLocation();
  sessionData.currentBooking.preferredLocation = 'Has to be in Redditch';
  await preferredLocationPage.enterPreferredLocationInformation(sessionData.currentBooking.preferredLocation);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Selected support types - the correct content is displayed', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const selectSupportTypePage = await checkYourDetailsNsaPage.changeSupportTypes();
  await verifyExactText(selectSupportTypePage.pageHeadingLocator, selectSupportTypePage.pageHeading);
  await verifyIsNotVisible(selectSupportTypePage.backLink);
  await verifyContainsText(selectSupportTypePage.updateBanner, selectSupportTypePage.updateBannerText);
  await verifyContainsText(selectSupportTypePage.updateBanner, selectSupportTypePage.updateBannerWarningText);
  for (let index = 0; index < sessionData.currentBooking.selectSupportType.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await t.expect(
      Selector(selectSupportTypePage.getOptionSelector(sessionData.currentBooking.selectSupportType[index])).checked,
    ).ok();
  }
  await verifyExactText(selectSupportTypePage.continueButton, selectSupportTypePage.updateButtonText);
  await verifyExactText(selectSupportTypePage.cancelButton, selectSupportTypePage.cancelButtonText);
});

test('Change Selected support types - cancel using the link in the banner, the original selected support types are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const selectSupportTypePage = await checkYourDetailsNsaPage.changeSupportTypes();
  await link(selectSupportTypePage.cancelLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Selected support types - cancel using the button at the bottom, the original selected support types are kept', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const selectSupportTypePage = await checkYourDetailsNsaPage.changeSupportTypes();
  await link(selectSupportTypePage.cancelButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Selected support types (GB) - save, go through remaining NSA journey and the new selected support types are shown', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  sessionData.currentBooking.selectSupportType = [SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlGB);

  const selectSupportTypePage = await checkYourDetailsNsaPage.changeSupportTypes();
  sessionData.currentBooking.selectSupportType = [SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.READING_SUPPORT, SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;
  await selectSupportTypePage.selectSupportTypes(sessionData.currentBooking.selectSupportType);
  // continue on the NSA journey now up till Check your details
  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToVoicemailConsentPage();
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Selected support types (NI) - save, go through remaining NSA journey and the new selected support types are shown', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
  sessionData.currentBooking.selectSupportType = [SupportType.TRANSLATOR, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlNI);

  const selectSupportTypePage = await checkYourDetailsNsaPage.changeSupportTypes();
  sessionData.currentBooking.selectSupportType = [SupportType.EXTRA_TIME, SupportType.OTHER, SupportType.READING_SUPPORT, SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.PORTUGUESE;
  await selectSupportTypePage.selectSupportTypes(sessionData.currentBooking.selectSupportType);
  // continue on the NSA journey now up till Check your details
  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToVoicemailConsentPage();
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionData);
});

test('Change Telephone number and Voicemail - updated details are displayed', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const telephoneNsaPage = await checkYourDetailsNsaPage.changeTelephone();
  const nsaVoicemailPage = await telephoneNsaPage.enterTelephoneNumber('00000000000');
  sessionDataNSA.candidate.telephone = '00000000000';
  await nsaVoicemailPage.selectVoicemailConsentGiven(true);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);

  const newTelephoneNsaPage = await checkYourDetailsNsaPage.changeTelephone();
  const nsaNewVoicemailPage = await newTelephoneNsaPage.enterTelephoneNumber('11111111111');
  sessionDataNSA.candidate.telephone = '11111111111';
  await nsaNewVoicemailPage.selectVoicemailConsentGiven(false);
  sessionDataNSA.currentBooking.voicemail = false;
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Telephone option as No, masks the Voicemail option fron the user - updated details are displayed', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const telephoneNsaPage = await checkYourDetailsNsaPage.changeTelephone();
  await telephoneNsaPage.selectTelephonePreferenceNo();
  sessionDataNSA.candidate.telephone = 'You added no details';
  sessionDataNSA.currentBooking.voicemail = false;
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Telephone option and cancel using the cancel button - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const telephoneNsaPage = await checkYourDetailsNsaPage.changeTelephone();
  await telephoneNsaPage.selectTelephoneContactPreference(false);
  await telephoneNsaPage.cancelUsingButton();
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Telephone option and cancel using the cancel link - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const telephoneNsaPage = await checkYourDetailsNsaPage.changeTelephone();
  await telephoneNsaPage.selectTelephoneContactPreference(false);
  await telephoneNsaPage.cancelUsingLink();
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Voicemail - updated details are displayed', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const voicemailPage = await checkYourDetailsNsaPage.changeVoicemail();
  await voicemailPage.selectVoicemailConsentGiven(false);
  sessionDataNSA.currentBooking.voicemail = false;
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Voicemail - and cancel using the cancel button - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const voicemailPage = await checkYourDetailsNsaPage.changeVoicemail();
  await voicemailPage.editVoicemailConsentGiven(false);
  await link(voicemailPage.cancelButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Voicemail - and cancel using the cancel link - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const voicemailPage = await checkYourDetailsNsaPage.changeVoicemail();
  await voicemailPage.editVoicemailConsentGiven(false);
  await link(voicemailPage.cancelLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Voicemail for NI - change button is available for a NI user when booking a car/motorcycle test', async () => {
  const sessionDataNSA = new SessionData(Target.NI, Locale.NI, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlNI);
  await verifyContainsText(checkYourDetailsNsaPage.pageHeadingLocator, checkYourDetailsNsaPage.pageHeading);
  await verifyIsVisible(checkYourDetailsNsaPage.changeVoiceoverLink);
});

test('Change Voicemail for NI - change button is hidden for a NI user when booking a test other than car/motorcycle', async () => {
  const sessionDataNSA = new SessionData(Target.NI, Locale.NI, true, false, true);
  sessionDataNSA.currentBooking.testType = TestType.TAXI;
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlNI);
  await verifyContainsText(checkYourDetailsNsaPage.pageHeadingLocator, checkYourDetailsNsaPage.pageHeading);
  await verifyIsNotVisible(checkYourDetailsNsaPage.changeVoiceoverLink);
});

test('Change Email Address - updated details are displayed', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const contactDetailsPage = await checkYourDetailsNsaPage.changeEmail();
  await contactDetailsPage.enterContactDetails('test@hotmail.co.uk', 'test@hotmail.co.uk');
  sessionDataNSA.candidate.email = 'test@hotmail.co.uk';
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Email Address - and cancel using the cancel button - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const contactDetailsPage = await checkYourDetailsNsaPage.changeEmail();
  await contactDetailsPage.editEmailAddress('test@hotmail.co.uk', 'test@hotmail.co.uk');
  await link(contactDetailsPage.cancelEmailButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Email Address - and cancel using the cancel link - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const contactDetailsPage = await checkYourDetailsNsaPage.changeEmail();
  await contactDetailsPage.editEmailAddress('test@hotmail.co.uk', 'test@hotmail.co.uk');
  await link(contactDetailsPage.cancelEmailLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Test type for GB - updated details are displayed', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await createCandidateAndLicence(sessionDataNSA);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const testTypePage = await checkYourDetailsNsaPage.changeTestType();
  await verifyContainsText(testTypePage.updateTestTypeBanner, testTypePage.updateTestTypeBannerText);
  await verifyExactText(testTypePage.warningIcon, '!');
  await verifyContainsText(testTypePage.warningMessageLocator, testTypePage.warningText);
  await testTypePage.selectTestCategory(TestType.MOTORCYCLE);
  sessionDataNSA.currentBooking.testType = TestType.MOTORCYCLE;
  const navigationHelperNSA = new NavigationHelperNSA(sessionDataNSA);
  await navigationHelperNSA.navigateToCheckYourDetailsPage();
});

test('Change Test type for NI - updated details are displayed', async () => {
  const sessionDataNSA = new SessionData(Target.NI, Locale.NI, true, false, true);
  await createCandidateAndLicence(sessionDataNSA);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlNI);

  const testTypePage = await checkYourDetailsNsaPage.changeTestType();
  await verifyContainsText(testTypePage.updateTestTypeBanner, testTypePage.updateTestTypeBannerText);
  await verifyExactText(testTypePage.warningIcon, '!');
  await verifyContainsText(testTypePage.warningMessageLocator, testTypePage.warningText);
  await testTypePage.selectTestCategory(TestType.MOTORCYCLE);
  sessionDataNSA.currentBooking.testType = TestType.MOTORCYCLE;
  const navigationHelperNSA = new NavigationHelperNSA(sessionDataNSA);
  await navigationHelperNSA.navigateToCheckYourDetailsPage();
});

test('Change Test type - and cancel using the cancel button - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await createCandidateAndLicence(sessionDataNSA);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const testTypePage = await checkYourDetailsNsaPage.changeTestType();
  await testTypePage.editTestCategory(TestTypeName.get(TestType.MOTORCYCLE));
  await link(testTypePage.cancelTestTypeButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change Test type - and cancel using the cancel link - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await createCandidateAndLicence(sessionDataNSA);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const testTypePage = await checkYourDetailsNsaPage.changeTestType();
  await testTypePage.editTestCategory(TestTypeName.get(TestType.MOTORCYCLE));
  await link(testTypePage.cancelTestTypeLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change On-screen language for GB - updated details are displayed', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const languagePage = await checkYourDetailsNsaPage.changeOnscreenLanguage();
  await languagePage.selectTestLanguage(Languages.get(Language.WELSH));
  sessionDataNSA.currentBooking.language = Language.WELSH;
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Verify On-screen language for NI cannot be updated', async () => {
  const sessionDataNSA = new SessionData(Target.NI, Locale.NI, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlNI);

  await verifyIsNotVisible(checkYourDetailsNsaPage.changeOnscreenLanguageLink);
});

test('Change On-screen language - and cancel using the cancel button - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const languagePage = await checkYourDetailsNsaPage.changeOnscreenLanguage();
  await languagePage.editTestLanguage(Languages.get(Language.WELSH));
  await link(languagePage.cancelLanguageButtonText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});

test('Change On-screen language - and cancel using the cancel link - updated details are ignored', async () => {
  const sessionDataNSA = new SessionData(Target.GB, Locale.GB, true, false, true);
  await setCookie(headerLogger, sessionDataNSA);
  await t.navigateTo(pageUrlGB);

  const languagePage = await checkYourDetailsNsaPage.changeOnscreenLanguage();
  await languagePage.editTestLanguage(Languages.get(Language.WELSH));
  await link(languagePage.cancelLanguageLinkText);
  await checkYourDetailsNsaPage.checkDataMatchesSession(sessionDataNSA);
});
