/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyTitleContainsText, verifyContainsText, verifyIsVisible, click, verifyIsNotVisible,
} from '../utils/helpers';
import { TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';
import { CustomSupportPage } from '../pages/custom-support-page';

const customSupportPage = new CustomSupportPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${customSupportPage.pathUrl}`;
const sessionData = new SessionData(TARGET.GB);
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Custom support for Non-Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    const sessionData = new SessionData(TARGET.GB);
    sessionData.journey.support = true;
    t.ctx.sessionData = sessionData;
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title, heading and content are displayed correctly', async () => {
  await verifyTitleContainsText(`${customSupportPage.pageTitle} ${generalTitle}`);
  await verifyExactText(customSupportPage.pageHeadingLocator, customSupportPage.pageHeading);
  await verifyExactText(customSupportPage.charCountHintText, customSupportPage.characterCountText);
});

test('Verify a validation error message is displayed when entering more than 4000 characters and the text is retained', async () => {
  await customSupportPage.enterSupportInformation(sessionData, Constants.stringWith4001Chars);
  await verifyTitleContainsText(`Error: ${customSupportPage.pageTitle} ${generalTitle}`);
  await verifyExactText(customSupportPage.errorMessageLocator, customSupportPage.errorMessageHeader);
  await verifyExactText(customSupportPage.errorMessageList, customSupportPage.errorMessageText);
  await verifyContainsText(customSupportPage.errorMessageTextAreaLocator, customSupportPage.errorMessageText);
  await verifyIsVisible(customSupportPage.errorLink);
  await customSupportPage.clickErrorLink();
  await t.expect(Selector(customSupportPage.supportTextArea).value).eql(Constants.stringWith4001Chars);
});

test('Verify user can proceed without entering any support details', async () => {
  await click(customSupportPage.continueButton);
  await verifyTitleContainsText(`${customSupportPage.pageTitle} ${generalTitle}`);
  await verifyIsNotVisible(customSupportPage.errorLink);
  await t.expect(Selector(customSupportPage.supportTextArea).value).eql('');
});

test('Verify user can proceed when entering some valid support details', async () => {
  await customSupportPage.enterSupportInformation(sessionData, 'Some support info');
  await verifyTitleContainsText(`${customSupportPage.pageTitle} ${generalTitle}`);
  await verifyIsNotVisible(customSupportPage.errorLink);
  await t.expect(Selector(customSupportPage.supportTextArea).value).eql('Some support info');
});
