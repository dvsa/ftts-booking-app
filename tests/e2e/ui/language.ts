/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, click, verifyContainsText, verifyIsVisible, setCookie, verifyTitleContainsText,
} from '../utils/helpers';
import { LanguagePage } from '../pages/language-page';
import { TestTypePage } from '../pages/test-type-page';
import {
  Language, Locale, Target,
} from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { NavigationHelper } from '../utils/navigation-helper';
import { generalTitle, Languages } from '../data/constants';
import { createCandidateAndLicence } from '../utils/crm/crm-data-helper';
import { SelectStandardSupportPage } from '../pages/select-standard-support-page';

const languagePage = new LanguagePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${languagePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Test language`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => {
    const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
    await createCandidateAndLicence(sessionData);
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page UI contents are displayed correctly', async () => {
  await verifyTitleContainsText(`${languagePage.pageHeading} ${generalTitle}`);
  await verifyExactText(languagePage.pageHeadingLocator, languagePage.pageHeading);
  await verifyExactText(languagePage.languageHintLocator, languagePage.languageHintText);
  await verifyIsVisible(languagePage.languageHintLocator);
});

test('Verify the Back link takes you to the test type page', async () => {
  await languagePage.goBack();
  const testTypePage: TestTypePage = new TestTypePage();
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
});

test('Verify the user is able to select English language and navigate to the select standard support page for a GB user', async () => {
  await languagePage.selectTestLanguage(Languages.get(Language.ENGLISH));
  const selectStandardSupportTypePage = new SelectStandardSupportPage();
  await verifyTitleContainsText(selectStandardSupportTypePage.pageHeading);
  await verifyExactText(selectStandardSupportTypePage.pageHeadingLocator, selectStandardSupportTypePage.pageHeading);
});

test('Verify the user is able to select Welsh language and navigate to the select standard support page for a GB user', async () => {
  await languagePage.selectTestLanguage(Languages.get(Language.WELSH));
  const selectStandardSupportTypePage = new SelectStandardSupportPage();
  await verifyTitleContainsText(selectStandardSupportTypePage.pageHeading);
  await verifyExactText(selectStandardSupportTypePage.pageHeadingLocator, selectStandardSupportTypePage.pageHeading);
});

test('Verify the user is unable to proceed without selecting the language and an error message is displayed, clicking on the link takes user to the field', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  const navigationHelper = new NavigationHelper(sessionData);
  await t.navigateTo(process.env.BOOKING_APP_URL);
  await navigationHelper.navigateToLanguagePage();
  await click(languagePage.continueButton);
  await verifyExactText(languagePage.errorMessageLocator, languagePage.errorMessageHeader);
  await verifyExactText(languagePage.errorMessageList, languagePage.errorMessageText);
  await verifyContainsText(languagePage.errorMessageRadioLocator, languagePage.errorMessageText);
  await verifyIsVisible(languagePage.errorLink);
  await languagePage.clickErrorLink();
});

test('Verify error prefix appears in the title when there is an error', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  const navigationHelper = new NavigationHelper(sessionData);
  await t.navigateTo(process.env.BOOKING_APP_URL);
  await navigationHelper.navigateToLanguagePage();
  await click(languagePage.continueButton);
  await verifyTitleContainsText('Error');
  await verifyTitleContainsText(`${languagePage.pageHeading} ${Constants.generalTitle}`);
});
