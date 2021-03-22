/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyTitleContainsText, verifyContainsText, verifyIsVisible, click, verifyIsNotVisible,
} from '../utils/helpers';
import { PreferredLocation, TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';
import { PreferredLocationNSAPage } from '../pages/preferred-location-nsa-page';

const preferredLocationNSAPage = new PreferredLocationNSAPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${preferredLocationNSAPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Preferred location for Non-Standard Accommodations`
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
  await verifyTitleContainsText(`${preferredLocationNSAPage.pageTitle} ${generalTitle}`);
  await verifyExactText(preferredLocationNSAPage.pageHeadingLocator, preferredLocationNSAPage.pageHeading);
  await verifyExactText(preferredLocationNSAPage.charCountHintText, preferredLocationNSAPage.characterCountText);
  await t.expect(Selector(preferredLocationNSAPage.getRadioSelector(PreferredLocation.DecideLater)).checked).notOk();
  await t.expect(Selector(preferredLocationNSAPage.getRadioSelector(PreferredLocation.ParticularLocation)).checked).notOk();
});

test('Verify user can proceed by selecting \'I know which locations I want\' and without entering any preferred location details', async () => {
  await preferredLocationNSAPage.selectPreferredLocationOption(t.ctx.sessionData, PreferredLocation.ParticularLocation);
  await click(preferredLocationNSAPage.continueButton);
  await verifyTitleContainsText(`${preferredLocationNSAPage.pageTitle} ${generalTitle}`);
  await verifyIsNotVisible(preferredLocationNSAPage.errorLinkRadio);
  await verifyIsNotVisible(preferredLocationNSAPage.errorLinkInput);
  await t.expect(Selector(preferredLocationNSAPage.preferredLocationTextArea).value).eql('');
});

test('Verify user can proceed by selecting \'I know which locations I want\' and entering some valid preferred location details', async () => {
  await preferredLocationNSAPage.selectPreferredLocationOption(t.ctx.sessionData, PreferredLocation.ParticularLocation);
  await preferredLocationNSAPage.enterPreferredLocationInformation(t.ctx.sessionData, 'I prefer Birmingham City Center');
  await click(preferredLocationNSAPage.continueButton);
  await verifyTitleContainsText(`${preferredLocationNSAPage.pageTitle} ${generalTitle}`);
  await verifyIsNotVisible(preferredLocationNSAPage.errorLinkRadio);
  await verifyIsNotVisible(preferredLocationNSAPage.errorLinkInput);
  await t.expect(Selector(preferredLocationNSAPage.preferredLocationTextArea).value).eql('I prefer Birmingham City Center');
});

test('Verify user can proceed by selecting \'I will decide this later\'', async () => {
  await preferredLocationNSAPage.selectPreferredLocationOption(t.ctx.sessionData, PreferredLocation.DecideLater);
  await click(preferredLocationNSAPage.continueButton);
  await verifyTitleContainsText(`${preferredLocationNSAPage.pageTitle} ${generalTitle}`);
  await verifyIsNotVisible(preferredLocationNSAPage.errorLinkRadio);
  await verifyIsNotVisible(preferredLocationNSAPage.errorLinkInput);
});

test('Verify a validation error message is displayed when not selecting any option', async () => {
  await click(preferredLocationNSAPage.continueButton);
  await verifyTitleContainsText(`Error: ${preferredLocationNSAPage.pageTitle} ${generalTitle}`);
  await verifyExactText(preferredLocationNSAPage.errorMessageLocator, preferredLocationNSAPage.errorMessageHeader);
  await verifyExactText(preferredLocationNSAPage.errorMessageList, preferredLocationNSAPage.errorMessageOptionNotSelectedText);
  await verifyContainsText(preferredLocationNSAPage.errorMessageRadioLocator, preferredLocationNSAPage.errorMessageOptionNotSelectedText);
  await verifyIsVisible(preferredLocationNSAPage.errorLinkRadio);
  await click(preferredLocationNSAPage.errorLinkRadio);
});

test('Verify a validation error message is displayed when entering more than 4000 characters and the text is retained', async () => {
  await preferredLocationNSAPage.selectPreferredLocationOption(t.ctx.sessionData, PreferredLocation.ParticularLocation);
  await preferredLocationNSAPage.enterPreferredLocationInformation(t.ctx.sessionData, Constants.stringWith4001Chars);
  await verifyTitleContainsText(`Error: ${preferredLocationNSAPage.pageTitle} ${generalTitle}`);
  await verifyExactText(preferredLocationNSAPage.errorMessageLocator, preferredLocationNSAPage.errorMessageHeader);
  await verifyExactText(preferredLocationNSAPage.errorMessageList, preferredLocationNSAPage.errorMessageTooManyCharsText);
  await verifyContainsText(preferredLocationNSAPage.errorMessageTextAreaLocator, preferredLocationNSAPage.errorMessageTooManyCharsText);
  await verifyIsVisible(preferredLocationNSAPage.errorLinkInput);
  await click(preferredLocationNSAPage.errorLinkInput);
  await t.expect(Selector(preferredLocationNSAPage.preferredLocationTextArea).value).eql(Constants.stringWith4001Chars);
});
