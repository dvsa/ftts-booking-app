/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, click, verifyTitleContainsText, verifyIsVisible, setCookie, verifyContainsText, verifyIsNotVisible,
} from '../utils/helpers';
import { TestTypePage } from '../pages/test-type-page';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { SessionData } from '../data/session-data';
import { TARGET } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { generalTitle } from '../data/constants';

const testTypePage = new TestTypePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${testTypePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Test type`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    await setCookie(headerLogger, new SessionData(TARGET.GB));
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page UI contents are displayed correctly', async () => {
  await verifyTitleContainsText(`${testTypePage.pageTitle} ${generalTitle}`);
  await verifyExactText(testTypePage.pageTitleLocator, testTypePage.pageHeading);
  await verifyExactText(testTypePage.subHeading, testTypePage.bookingOtherTypesOfTestsHeader);
  await verifyContainsText(testTypePage.bodyTextLocator, testTypePage.bookingOtherTypesOfTestsText, 1);
  await verifyIsVisible(testTypePage.bookingOtherTypesOfTestsLink);
});

test('Verify the Back link takes you to the Contact details page', async () => {
  await testTypePage.goBack();
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyExactText(contactDetailsPage.pageTitleLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is unable to proceed without selecting a theory test type and an error message is displayed', async (t) => {
  await t.navigateTo(process.env.BOOKING_APP_URL);
  const sessionData = new SessionData(TARGET.GB);
  const navigationHelper = new NavigationHelper(sessionData);
  await navigationHelper.navigateToTestTypePage();

  await click(testTypePage.continueButton);
  await verifyExactText(testTypePage.errorMessageLocator, testTypePage.errorMessageHeader);
  await verifyExactText(testTypePage.errorMessageList, testTypePage.errorMessageText);
  await verifyContainsText(testTypePage.errorMessageRadioLocator, testTypePage.errorMessageText);
});

test('Verify the error message links to the radio button for the user to navigate to', async (t) => {
  await t.navigateTo(process.env.BOOKING_APP_URL);
  const sessionData = new SessionData(TARGET.GB);
  const navigationHelper = new NavigationHelper(sessionData);
  await navigationHelper.navigateToTestTypePage();

  await click(testTypePage.continueButton);
  await verifyIsVisible(testTypePage.errorLink);
  await testTypePage.clickErrorLink();
});

test('Verify error prefix appears in the title when there is an error', async (t) => {
  await t.navigateTo(process.env.BOOKING_APP_URL);
  const sessionData = new SessionData(TARGET.GB);
  const navigationHelper = new NavigationHelper(sessionData);
  await navigationHelper.navigateToTestTypePage();

  await click(testTypePage.continueButton);
  await verifyTitleContainsText(`Error: ${testTypePage.pageTitle} ${Constants.generalTitle}`);
});

test('Verify the back link is not visible in the Non-Standard Accommodation journey', async (t) => {
  const sessionData = new SessionData(TARGET.GB);
  sessionData.journey.support = true;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);
  verifyIsNotVisible(testTypePage.backLink);
});
