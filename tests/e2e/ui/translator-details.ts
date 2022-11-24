/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  setCookie, verifyTitleContainsText, verifyContainsText, verifyIsVisible, click, clearField,
} from '../utils/helpers';
import { Locale, SupportType, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { TranslatorPage } from '../pages/translator-page';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { StayingNSAPage } from '../pages/staying-nsa-page';
import { createCandidateAndLicence } from '../utils/crm/crm-data-helper';

const translatorPage = new TranslatorPage();
const selectSupportTypePage = new SelectSupportTypePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${translatorPage.pathUrl}?target=${Target.NI}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Translator details for Non-Standard Accommodations (NI only)`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => {
    const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);
    await createCandidateAndLicence(sessionData);
    sessionData.currentBooking.selectSupportType = [SupportType.TRANSLATOR];
    t.ctx.sessionData = sessionData;
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title, heading and content are displayed correctly', async () => {
  await verifyContainsText(translatorPage.pageHeadingLocator, translatorPage.pageHeading);
  await verifyIsVisible(translatorPage.backLink);
});

test('Verify Back link takes you to the Select Support Type page', async () => {
  await translatorPage.goBack();
  await verifyTitleContainsText(`${selectSupportTypePage.pageHeading}`);
  await verifyContainsText(selectSupportTypePage.pageHeadingLocator, selectSupportTypePage.pageHeading);
});

test('Verify a validation error message is displayed when entering more than 100 characters and the text is retained', async () => {
  await translatorPage.enterTranslatorDetails(Constants.stringWith101Chars);
  await verifyTitleContainsText('Error:');
  await verifyContainsText(translatorPage.errorMessageLocator, translatorPage.errorMessageHeader);
  await verifyContainsText(translatorPage.errorMessageList, translatorPage.overLimitErrorMessageText);
  await verifyContainsText(translatorPage.errorMessageTextAreaLocator, translatorPage.overLimitErrorMessageText);
  await verifyIsVisible(translatorPage.errorLink);
  await translatorPage.clickErrorLink();
  await t.expect(Selector(translatorPage.translatorTextArea).value).eql(Constants.stringWith101Chars);
});

test('Verify a validation error message is displayed when not entering any text', async () => {
  await clearField(translatorPage.translatorTextArea);
  await click(translatorPage.continueButton);
  await verifyTitleContainsText('Error:');
  await verifyContainsText(translatorPage.errorMessageLocator, translatorPage.errorMessageHeader);
  await verifyContainsText(translatorPage.errorMessageList, translatorPage.emptyErrorMessageText);
  await verifyContainsText(translatorPage.errorMessageTextAreaLocator, translatorPage.emptyErrorMessageText);
  await verifyIsVisible(translatorPage.errorLink);
  await translatorPage.clickErrorLink();
});

test('Verify the user is able to proceed when entering valid translator details', async () => {
  await translatorPage.enterTranslatorDetails('I would like a translator for Chinese');
  const stayingNSAPage = new StayingNSAPage();
  await verifyTitleContainsText(`${stayingNSAPage.pageHeadingNoEvidence}`);
  await verifyContainsText(stayingNSAPage.pageHeadingLocator, stayingNSAPage.pageHeadingNoEvidence);
});
