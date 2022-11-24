/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import {
  setCookie, verifyContainsText,
} from '../utils/helpers';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { Locale, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { setRequestTimeout } from '../data/constants';

const sessionData = new SessionData(Target.NI, Locale.NI);
const chooseAppointmentPage = new ChooseAppointmentPage();
const preferredDatePage = new PreferredDatePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${preferredDatePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Choose appointment - NI`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async (t) => {
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyContainsText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
});

test('Verify the Back link takes you to the preferred date page', async () => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyContainsText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
  await chooseAppointmentPage.goBack();
  await verifyContainsText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
});
