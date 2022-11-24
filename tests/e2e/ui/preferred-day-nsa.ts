/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyTitleContainsText, verifyContainsText, verifyIsVisible, click,
} from '../utils/helpers';
import { PreferredDay, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';
import { PreferredDayNSAPage } from '../pages/preferred-day-nsa-page';
import { PreferredLocationNSAPage } from '../pages/preferred-location-nsa-page';

const preferredDayNSAPage = new PreferredDayNSAPage();
const preferredLocationNSAPage = new PreferredLocationNSAPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${preferredDayNSAPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Preferred day for Non-Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => {
    const sessionData = new SessionData(Target.GB);
    sessionData.journey.support = true;
    t.ctx.sessionData = sessionData;
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title, heading and content are displayed correctly', async () => {
  await verifyTitleContainsText(`${preferredDayNSAPage.pageHeading} ${generalTitle}`);
  await verifyExactText(preferredDayNSAPage.pageHeadingLocator, preferredDayNSAPage.pageHeading);
  await verifyExactText(preferredDayNSAPage.charCountHintText, preferredDayNSAPage.characterCountText);
  await t.expect(Selector(preferredDayNSAPage.getRadioSelector(PreferredDay.DecideLater)).checked).notOk();
  await t.expect(Selector(preferredDayNSAPage.getRadioSelector(PreferredDay.ParticularDay)).checked).notOk();
});

test('Verify user can proceed by selecting \'I want a particular day\' and without entering any preferred day details', async () => {
  await preferredDayNSAPage.selectPreferredDayOption(PreferredDay.ParticularDay);
  await click(preferredDayNSAPage.continueButton);
  await verifyTitleContainsText(`${preferredLocationNSAPage.pageHeading} ${generalTitle}`);
});

test('Verify user can proceed by selecting \'I want a particular day\' and entering some valid preferred day details', async () => {
  await preferredDayNSAPage.selectPreferredDayOption(PreferredDay.ParticularDay);
  await preferredDayNSAPage.enterPreferredDayInformation('I prefer Saturdays only');
  await click(preferredDayNSAPage.continueButton);
  await verifyTitleContainsText(`${preferredLocationNSAPage.pageHeading} ${generalTitle}`);
});

test('Verify user can proceed by selecting \'I will decide this later\'', async () => {
  await preferredDayNSAPage.selectPreferredDayOption(PreferredDay.DecideLater);
  await click(preferredDayNSAPage.continueButton);
  await verifyTitleContainsText(`${preferredLocationNSAPage.pageHeading} ${generalTitle}`);
});

test('Verify a validation error message is displayed when not selecting any option', async () => {
  await click(preferredDayNSAPage.continueButton);
  await verifyTitleContainsText('Error');
  await verifyTitleContainsText(`${preferredDayNSAPage.pageHeading} ${generalTitle}`);
  await verifyExactText(preferredDayNSAPage.errorMessageLocator, preferredDayNSAPage.errorMessageHeader);
  await verifyExactText(preferredDayNSAPage.errorMessageList, preferredDayNSAPage.errorMessageOptionNotSelectedText);
  await verifyContainsText(preferredDayNSAPage.errorMessageRadioLocator, preferredDayNSAPage.errorMessageOptionNotSelectedText);
  await verifyIsVisible(preferredDayNSAPage.errorLinkRadio);
  await click(preferredDayNSAPage.errorLinkRadio);
});

test('Verify a validation error message is displayed when entering more than 4000 characters and the text is retained', async () => {
  await preferredDayNSAPage.selectPreferredDayOption(PreferredDay.ParticularDay);
  await preferredDayNSAPage.enterPreferredDayInformation(Constants.stringWith4001Chars);
  await verifyTitleContainsText('Error');
  await verifyTitleContainsText(`${preferredDayNSAPage.pageHeading} ${generalTitle}`);
  await verifyExactText(preferredDayNSAPage.errorMessageLocator, preferredDayNSAPage.errorMessageHeader);
  await verifyExactText(preferredDayNSAPage.errorMessageList, preferredDayNSAPage.errorMessageTooManyCharsText);
  await verifyContainsText(preferredDayNSAPage.errorMessageTextAreaLocator, preferredDayNSAPage.errorMessageTooManyCharsText);
  await verifyIsVisible(preferredDayNSAPage.errorLinkInput);
  await click(preferredDayNSAPage.errorLinkInput);
  await t.expect(Selector(preferredDayNSAPage.preferredDayTextArea).value).eql(Constants.stringWith4001Chars);
});
