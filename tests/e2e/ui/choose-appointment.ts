/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector } from 'testcafe';
import dayjs from 'dayjs';
import {
  verifyExactText, setCookie, verifyIsVisible, createSelector, getText, verifyTitleContainsText, verifyContainsText,
} from '../utils/helpers';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { CheckYourDetailsPage } from '../pages/check-your-details-page';
import { Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle, MEDIUM_TIMEOUT, setRequestTimeout } from '../data/constants';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';

const sessionData = new SessionData(Target.GB);
const chooseAppointmentPage = new ChooseAppointmentPage();
const preferredDatePage = new PreferredDatePage();
const dateRegex = new RegExp('(?:\\?selectedDate=)(.{10}?)');
const pageUrl = `${process.env.BOOKING_APP_URL}/${preferredDatePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Choose appointment`
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

test('Verify the Change link takes you to the choose a test centre page', async () => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);
  await chooseAppointmentPage.changeTestCentre();
  const findATheoryTestCentrePage = new FindATheoryTestCentrePage();
  await verifyExactText(findATheoryTestCentrePage.pageHeadingLocator, findATheoryTestCentrePage.pageHeading);
});

test('Verify page of appointment times is rendered correctly on the browser', async (t) => {
  const mySessionData = new SessionData(Target.GB);
  await preferredDatePage.selectPreferredDateWithAppointments(mySessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  await verifyExactText(chooseAppointmentPage.changeTestCenterLocator, chooseAppointmentPage.changeTestCentreText);
  await verifyExactText(chooseAppointmentPage.testCentreNameLocator, mySessionData.currentBooking.centre.name);

  // check preferred date is the selected date
  const currentSelectedDate = await getText(chooseAppointmentPage.selectedDate);

  const month = dayjs(mySessionData.testCentreSearch.selectedDate).format('MMMM');
  const dayOfWeek = dayjs(mySessionData.testCentreSearch.selectedDate).format('dddd');
  const dayOfMonth = dayjs(mySessionData.testCentreSearch.selectedDate).format('D');

  await t.expect(currentSelectedDate).contains(`${dayOfWeek}`);
  await t.expect(currentSelectedDate).contains(`${dayOfMonth} ${month}`);

  // at least 1 of the slot headers should be visible
  const slotHeader = await getText(chooseAppointmentPage.morningAfternoonSlotsHeader, 0);
  await t.expect(slotHeader).match(new RegExp('^Morning|Afternoon'));

  await verifyIsVisible(chooseAppointmentPage.selectATime);

  const appointmentTabCount = await createSelector(chooseAppointmentPage.appointmentDayTabs).filterVisible().count;
  if (t.browser.platform.toLowerCase() === 'mobile') {
    await t.expect(appointmentTabCount).eql(3);
  } else {
    await t.expect(appointmentTabCount).eql(7);
    // Monday to Sunday should always be visible in Desktop
    await verifyExactText(chooseAppointmentPage.tabDay, 'Monday', 0);
    await verifyExactText(chooseAppointmentPage.tabDay, 'Tuesday', 1);
    await verifyExactText(chooseAppointmentPage.tabDay, 'Wednesday', 2);
    await verifyExactText(chooseAppointmentPage.tabDay, 'Thursday', 3);
    await verifyExactText(chooseAppointmentPage.tabDay, 'Friday', 4);
    await verifyExactText(chooseAppointmentPage.tabDay, 'Saturday', 5);
    await verifyExactText(chooseAppointmentPage.tabDay, 'Sunday', 6);
  }
});

test('Verify after selecting an available appointment time we are shown the check your booking page', async () => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  const checkYourDetailsPage = new CheckYourDetailsPage();
  await verifyContainsText(checkYourDetailsPage.pageHeadingLocator, checkYourDetailsPage.pageHeading);
});

test('Verify a warning message is displayed if my preferred date has no appointment times available', async () => {
  const mySessionData = new SessionData(Target.GB);
  await preferredDatePage.selectPreferredDateWithNoAppointments(mySessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  await verifyExactText(chooseAppointmentPage.warningMessageLocator, chooseAppointmentPage.noSlotsAvailableWarningText);
});

test('Verify clicking the \'previous\' link shows the previous set of available appointment times', async (t) => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  // get currently selected date and get the date value from the link
  const currentSelectedDate: string = await createSelector(chooseAppointmentPage.selectedDate).getAttribute('href');
  const currentSelectedDateObj = new Date(dateRegex.exec(currentSelectedDate)[1]);

  if (t.browser.platform.toLowerCase() === 'mobile') {
    // check we are moving back by 1-3 days (because on mobile if it hits the start of the week it will stop on Monday)
    const prevLinkDate: string = await Selector('a').withExactText(chooseAppointmentPage.prevDayLinkText).getAttribute('href');
    const prevLinkDateObj = new Date(dateRegex.exec(prevLinkDate)[1]);
    const diff = (currentSelectedDateObj.getTime() - prevLinkDateObj.getTime()) / (1000 * 3600 * 24);
    await t.expect(diff).within(1, 3);
    await chooseAppointmentPage.showPreviousDaysAppointments();
  } else {
    // check we are moving back by 7 days from the current date
    const prevLinkDate: string = await Selector('a').withExactText(chooseAppointmentPage.prevWeekLinkText).getAttribute('href');
    const prevLinkDateObj = new Date(dateRegex.exec(prevLinkDate)[1]);
    const diff = Math.round((currentSelectedDateObj.getTime() - prevLinkDateObj.getTime()) / (1000 * 3600 * 24));
    await t.expect(diff).eql(7);
    await chooseAppointmentPage.showPreviousWeeksAppointments();
  }
  // synchronisation point, wait for the request to finish
  await t.expect(await createSelector(chooseAppointmentPage.selectedDate).getAttribute('href')).notEql(currentSelectedDate, { timeout: MEDIUM_TIMEOUT });

  // check that the newly selected date is now before the old selected date
  const newlySelectedDate: string = await createSelector(chooseAppointmentPage.selectedDate).getAttribute('href');
  const newlySelectedDateObj = new Date(dateRegex.exec(newlySelectedDate)[1]);

  await t.expect(newlySelectedDateObj.valueOf()).lt(currentSelectedDateObj.valueOf());
});

test('Verify clicking the \'next\' link shows the next available set of appointment times', async (t) => {
  await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  // get currently selected date and get the date value from the link
  const currentSelectedDate: string = await createSelector(chooseAppointmentPage.selectedDate).getAttribute('href');
  const currentSelectedDateObj = new Date(dateRegex.exec(currentSelectedDate)[1]);

  if (t.browser.platform.toLowerCase() === 'mobile') {
    // check we are moving fwd by 1-3 days (because on mobile if it hits the end of the week it will stop on Sunday)
    const nextLinkDate: string = await Selector('a').withExactText(chooseAppointmentPage.nextDayLinkText).getAttribute('href');
    const nextLinkDateObj = new Date(dateRegex.exec(nextLinkDate)[1]);
    const diff = (nextLinkDateObj.getTime() - currentSelectedDateObj.getTime()) / (1000 * 3600 * 24);
    await t.expect(diff).within(1, 3);
    await chooseAppointmentPage.showNextDaysAppointments();
  } else {
    // check we are moving fwd by 7 days from the current date
    const nextLinkDate: string = await Selector('a').withExactText(chooseAppointmentPage.nextWeekLinkText).getAttribute('href');
    const nextLinkDateObj = new Date(dateRegex.exec(nextLinkDate)[1]);
    const diff = Math.round((nextLinkDateObj.getTime() - currentSelectedDateObj.getTime()) / (1000 * 3600 * 24));
    await t.expect(diff).eql(7);
    await chooseAppointmentPage.showNextWeeksAppointments();
  }
  // synchronisation point, wait for the request to finish
  await t.expect(await createSelector(chooseAppointmentPage.selectedDate).getAttribute('href')).notEql(currentSelectedDate, { timeout: MEDIUM_TIMEOUT });

  // check that the newly selected date is now after the old selected date
  const newlySelectedDate: string = await createSelector(chooseAppointmentPage.selectedDate).getAttribute('href');
  const newlySelectedDateObj = new Date(dateRegex.exec(newlySelectedDate)[1]);

  await t.expect(newlySelectedDateObj.valueOf()).gt(currentSelectedDateObj.valueOf());
});

test('Verify a warning message is displayed if trying to view appointments times for a date in the past', async (t) => {
  const preferredDate = dayjs().add(2, 'day');
  await preferredDatePage.enterPreferredDateAndSubmit(
    preferredDate.format('DD'),
    preferredDate.format('MM'),
    preferredDate.format('YYYY'),
  );
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  if (t.browser.platform.toLowerCase() === 'mobile') {
    // go back a few days on mobile to ensure its in the past
    await chooseAppointmentPage.showPreviousDaysAppointments();
    await chooseAppointmentPage.showPreviousDaysAppointments();
  } else {
    await chooseAppointmentPage.showPreviousWeeksAppointments();
  }
  await verifyExactText(chooseAppointmentPage.warningMessageLocator, chooseAppointmentPage.pastDaysWarningText);
});

test('Verify a warning message is displayed if trying to view appointments times for a date in the future', async (t) => {
  const futureDate = dayjs().add(6, 'month').subtract(1, 'day');
  await preferredDatePage.enterPreferredDateAndSubmit(
    futureDate.format('DD'),
    futureDate.format('MM'),
    futureDate.format('YYYY'),
  );
  await verifyTitleContainsText(`${chooseAppointmentPage.pageHeading} ${generalTitle}`);
  await verifyExactText(chooseAppointmentPage.pageHeadingLocator, chooseAppointmentPage.pageHeading);

  if (t.browser.platform.toLowerCase() === 'mobile') {
    await chooseAppointmentPage.showNextDaysAppointments();
  } else {
    await chooseAppointmentPage.showNextWeeksAppointments();
  }
  await verifyExactText(chooseAppointmentPage.warningMessageLocator, chooseAppointmentPage.futureDaysWarningText);
});
