/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyTitleContainsText, verifyContainsText, verifyIsVisible, click,
} from '../utils/helpers';
import { Locale, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';
import { CustomSupportPage } from '../pages/custom-support-page';
import { StayingNSAPage } from '../pages/staying-nsa-page';
import { createCandidateAndLicence } from '../utils/crm/crm-data-helper';

const customSupportPage = new CustomSupportPage();
const stayingNsaPage = new StayingNSAPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${customSupportPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Custom support for Non-Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => {
    const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
    await createCandidateAndLicence(sessionData);
    sessionData.currentBooking.customSupport = undefined;
    t.ctx.sessionData = sessionData;
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title, heading and content are displayed correctly', async () => {
  await verifyTitleContainsText(`${customSupportPage.pageHeading} ${generalTitle}`);
  await verifyExactText(customSupportPage.pageHeadingLocator, customSupportPage.pageHeading);
  await verifyExactText(customSupportPage.charCountHintText, customSupportPage.characterCountText);
});

test('Verify a validation error message is displayed when entering more than 4000 characters and the text is retained', async () => {
  await customSupportPage.enterSupportInformation(Constants.stringWith4001Chars);
  await verifyTitleContainsText('Error');
  await verifyTitleContainsText(`${customSupportPage.pageHeading} ${generalTitle}`);
  await verifyExactText(customSupportPage.errorMessageLocator, customSupportPage.errorMessageHeader);
  await verifyExactText(customSupportPage.errorMessageList, customSupportPage.errorMessageText);
  await verifyContainsText(customSupportPage.errorMessageTextAreaLocator, customSupportPage.errorMessageText);
  await verifyIsVisible(customSupportPage.errorLink);
  await customSupportPage.clickErrorLink();
  await t.expect(Selector(customSupportPage.supportTextArea).value).eql(Constants.stringWith4001Chars);
});

test('Verify user can proceed without entering any support details', async () => {
  await click(customSupportPage.continueButton);
  await verifyTitleContainsText(`${stayingNsaPage.pageHeadingEvidence} ${generalTitle}`);
});

test('Verify user can proceed when entering some valid support details', async () => {
  await customSupportPage.enterSupportInformation('Some support info');
  await verifyTitleContainsText(`${stayingNsaPage.pageHeadingEvidence} ${generalTitle}`);
});
