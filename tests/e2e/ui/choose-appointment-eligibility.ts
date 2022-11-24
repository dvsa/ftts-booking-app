/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import dayjs from 'dayjs';
import {
  verifyTitleContainsText, verifyContainsText, setAcceptCookies, verifyExactText, verifyIsNotVisible, link,
} from '../utils/helpers';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { Target, TestType } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle, setRequestTimeout } from '../data/constants';
import { NavigationHelper } from '../utils/navigation-helper';

const preferredDatePage = new PreferredDatePage();
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Choose appointment eligibility`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async () => {
    await setAcceptCookies();
  })
  .meta('type', 'regression');

// these tests are only currently applicable against the json-server mock and eligibility mock as we can control the eligibility responses easily
test('Verify correct message appears to inform the candidate the earliest date they can book their test from', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.candidate.licenceNumber = 'BENTO603026A97BQ';
  sessionData.candidate.firstnames = 'Abdur-Rahman';
  sessionData.candidate.surname = 'Benton';
  sessionData.candidate.dateOfBirth = '1966-03-02';
  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  await new NavigationHelper(sessionData).navigateToPreferredDatePage();

  const notEligibleDate = dayjs().add(3, 'month').subtract(1, 'day');
  const eligibleFromDate = dayjs().add(3, 'month');
  const chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit(
    notEligibleDate.format('DD'),
    notEligibleDate.format('MM'),
    notEligibleDate.format('YYYY'),
  );
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  const warningText = `You are not eligible to take tests on the date selected. The earliest date you can book the test for is ${eligibleFromDate.format('D')} ${eligibleFromDate.format('MMMM')} ${eligibleFromDate.format('YYYY')}`;
  await verifyExactText(chooseAppointmentPage.warningMessageLocator, warningText);
  await verifyIsNotVisible(chooseAppointmentPage.selectATime);
});

test('Verify \'Select another date\' link takes you back to the preferred date page', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.candidate.licenceNumber = 'BENTO603026A97BQ';
  sessionData.candidate.firstnames = 'Abdur-Rahman';
  sessionData.candidate.surname = 'Benton';
  sessionData.candidate.dateOfBirth = '1966-03-02';
  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  await new NavigationHelper(sessionData).navigateToPreferredDatePage();

  const notEligibleDate = dayjs().add(3, 'month').subtract(1, 'day');
  const chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit(
    notEligibleDate.format('DD'),
    notEligibleDate.format('MM'),
    notEligibleDate.format('YYYY'),
  );
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
  await link(chooseAppointmentPage.selectAnotherDateLinkText);

  await verifyTitleContainsText(`${preferredDatePage.pageHeading} ${generalTitle}`);
  await verifyContainsText(preferredDatePage.pageHeadingLocator, preferredDatePage.pageHeading);
});

test('Verify correct message appears to inform the candidate when they are no longer eligible to book after a certain date', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.candidate.licenceNumber = '17874131';
  sessionData.candidate.firstnames = 'Glen William';
  sessionData.candidate.surname = 'Delaney';
  sessionData.candidate.dateOfBirth = '2000-09-02';
  sessionData.currentBooking.testType = TestType.CAR;
  await new NavigationHelper(sessionData).navigateToPreferredDatePage();

  const notEligibleDate = dayjs().add(2, 'month').add(1, 'day');
  const chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit(
    notEligibleDate.format('DD'),
    notEligibleDate.format('MM'),
    notEligibleDate.format('YYYY'),
  );
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  const warningText = 'You are not eligible to take tests on the day selected. For eligibility queries, contact DVSA.';
  await verifyExactText(chooseAppointmentPage.warningMessageLocator, warningText);
  await verifyIsNotVisible(chooseAppointmentPage.selectATime);
});
