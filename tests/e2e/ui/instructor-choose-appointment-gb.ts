/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import {
  verifyExactText, setCookie, verifyTitleContainsText,
} from '../utils/helpers';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { Locale, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle, setRequestTimeout } from '../data/constants';

const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
const chooseAppointmentPage = new ChooseAppointmentPage();
const preferredDatePage = new PreferredDatePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/instructor/${preferredDatePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Instructor - Choose appointment - GB`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async (t) => {
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'instructor');

test('Verify page title and heading are displayed correctly', async () => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
});

test('Verify the Back link takes you to the preferred date page', async () => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
  await chooseAppointmentPage.goBack();
  await verifyTitleContainsText(`${preferredDatePage.pageHeading} ${generalTitle}`);
  await verifyExactText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
});
