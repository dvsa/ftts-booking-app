/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  setCookie, verifyTitleContainsText, verifyContainsText, verifyIsVisible, click, verifyIsNotVisible,
} from '../utils/helpers';
import { Locale, SupportType, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { TestTypePage } from '../pages/test-type-page';
import { LanguagePage } from '../pages/language-page';

const selectSupportTypePage = new SelectSupportTypePage();
const languagePage = new LanguagePage();
const testTypePage = new TestTypePage();
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

async function navigateToSelectSupportTypePage(target: Target, locale: Locale) {
  const sessionData = new SessionData(target, locale, true);
  sessionData.currentBooking.selectSupportType = undefined;
  t.ctx.sessionData = sessionData;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(`${process.env.BOOKING_APP_URL}/${selectSupportTypePage.pathUrl}?target=${target}`);
}

fixture`Select support types for Non-Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title, heading and content are displayed correctly - GB', async () => {
  await navigateToSelectSupportTypePage(Target.GB, Locale.GB);
  await verifyTitleContainsText(selectSupportTypePage.pageHeading);
  await verifyContainsText(selectSupportTypePage.pageHeadingLocator, selectSupportTypePage.pageHeading);
  await verifyIsVisible(selectSupportTypePage.backLink);
  await verifyIsNotVisible(selectSupportTypePage.translatorOption);
});

test('Verify page title, heading and content are displayed correctly - NI', async () => {
  await navigateToSelectSupportTypePage(Target.NI, Locale.NI);
  await verifyTitleContainsText(selectSupportTypePage.pageHeading);
  await verifyContainsText(selectSupportTypePage.pageHeadingLocator, selectSupportTypePage.pageHeading);
  await verifyIsVisible(selectSupportTypePage.backLink);
  await verifyIsVisible(selectSupportTypePage.translatorOption);
});

test('Verify Back link takes you to the Language page - GB', async () => {
  await navigateToSelectSupportTypePage(Target.GB, Locale.GB);
  await selectSupportTypePage.goBack();
  await verifyTitleContainsText(`${languagePage.pageHeading}`);
  await verifyContainsText(languagePage.pageHeadingLocator, languagePage.pageHeading);
});

test('Verify Back link takes you to the Test type page - NI', async () => {
  await navigateToSelectSupportTypePage(Target.NI, Locale.NI);
  await selectSupportTypePage.goBack();
  await verifyTitleContainsText(`${testTypePage.pageHeadingNSA}`);
  await verifyContainsText(testTypePage.pageHeadingLocator, testTypePage.pageHeadingNSA);
});

test('Verify a validation error message is displayed when not selecting any support types', async () => {
  await navigateToSelectSupportTypePage(Target.GB, Locale.GB);
  await click(selectSupportTypePage.continueButton);
  await verifyTitleContainsText('Error:');
  await verifyContainsText(selectSupportTypePage.errorMessageLocator, selectSupportTypePage.errorMessageHeader);
  await verifyContainsText(selectSupportTypePage.errorMessageList, selectSupportTypePage.errorMessageNothingSelectText);
  await verifyContainsText(selectSupportTypePage.errorMessageFieldLocator, selectSupportTypePage.errorMessageNothingSelectText);
  await verifyIsVisible(selectSupportTypePage.errorLink);
  await selectSupportTypePage.clickErrorLink();
});

test('Verify a validation error message is displayed when attempting to select Onscreen BSL and Voiceover together', async () => {
  await navigateToSelectSupportTypePage(Target.GB, Locale.GB);
  await selectSupportTypePage.selectSupportTypes([SupportType.ON_SCREEN_BSL, SupportType.VOICEOVER]);
  await verifyTitleContainsText('Error:');
  await verifyContainsText(selectSupportTypePage.errorMessageLocator, selectSupportTypePage.errorMessageHeader);
  await verifyContainsText(selectSupportTypePage.errorMessageList, selectSupportTypePage.errorMessageBslVoiceoverSelectedText);
  await verifyContainsText(selectSupportTypePage.errorMessageFieldLocator, selectSupportTypePage.errorMessageBslVoiceoverSelectedText);
  await verifyIsVisible(selectSupportTypePage.errorLink);
  await selectSupportTypePage.clickErrorLink();
});
