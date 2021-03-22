/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, click, verifyContainsText, verifyIsVisible, setCookie, verifyTitleContainsText, capitalizeFirstLetter,
} from '../utils/helpers';
import { LanguagePage } from '../pages/language-page';
import { TestTypePage } from '../pages/test-type-page';
import { LANGUAGE, TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { NavigationHelper } from '../utils/navigation-helper';
import { generalTitle, LANGUAGES } from '../data/constants';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';

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
    await setCookie(headerLogger, new SessionData(TARGET.GB));
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page UI contents are displayed correctly', async () => {
  await verifyTitleContainsText(`${languagePage.pageTitle} ${generalTitle}`);
  await verifyExactText(languagePage.pageTitleLocator, languagePage.pageHeading);
  await verifyExactText(languagePage.languageHintLocator, languagePage.languageHintText);
  await verifyIsVisible(languagePage.languageHintLocator);
});

test('Verify the Back link takes you to the test type page', async () => {
  await languagePage.goBack();
  const testTypePage: TestTypePage = new TestTypePage();
  await verifyExactText(testTypePage.pageTitleLocator, testTypePage.pageHeading);
});

test('Verify the user is able enter english language and navigate to the find a test centre page for a GB user', async () => {
  await languagePage.selectTestLanguage(LANGUAGES.get(LANGUAGE.ENGLISH));
  const findTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  await verifyExactText(findTestCentrePage.pageTitleLocator, findTestCentrePage.pageHeading);
});

test('Verify the user is able enter welsh language and navigate to the find a test centre page page for a GB user', async () => {
  await languagePage.selectTestLanguage(LANGUAGES.get(LANGUAGE.WELSH));
  const findTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  await verifyExactText(findTestCentrePage.pageTitleLocator, findTestCentrePage.pageHeading);
});

test('Verify the user is able skip the language page and navigate to the find a test centre page for a NI user', async () => {
  const sessionData = new SessionData(TARGET.NI);
  const navigationHelper = new NavigationHelper(sessionData);
  await t.navigateTo(`${process.env.BOOKING_APP_URL}?target=${TARGET.NI}`);
  const testTypePage = await navigationHelper.navigateToNiTestTypePage();
  const findTestCentrePage = await testTypePage.selectTestCategoryNI(capitalizeFirstLetter(Constants.TEST_TYPE.CAR));
  await verifyExactText(findTestCentrePage.pageTitleLocator, findTestCentrePage.pageHeading);
});

test('Verify the user is unable to proceed without selecting the language and an error message is displayed, clicking on the link takes user to the field', async () => {
  const sessionData = new SessionData(TARGET.GB);
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
  const sessionData = new SessionData(TARGET.GB);
  const navigationHelper = new NavigationHelper(sessionData);
  await t.navigateTo(process.env.BOOKING_APP_URL);
  await navigationHelper.navigateToLanguagePage();
  await click(languagePage.continueButton);
  await verifyTitleContainsText(`Error: ${languagePage.pageTitle} ${Constants.generalTitle}`);
});
