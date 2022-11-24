/* eslint-disable security/detect-non-literal-regexp */
import * as Constants from '../data/constants';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { SessionData } from '../data/session-data';
import {
  click, runningTestsLocally, setAcceptCookies, verifyContainsText,
} from '../utils/helpers';
import { Target } from '../../../src/domain/enums';
import { WhatDoYouWantToChangePage } from '../pages/what-do-you-want-to-change-page';
import { CheckChangePage } from '../pages/check-change-page';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const whatDoYouWantToChangePage = new WhatDoYouWantToChangePage();
const checkChangePage = new CheckChangePage();
const changeConfirmedPage = new ChangeConfirmedPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Reschedule booking - NI`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    await setAcceptCookies();
    const sessionData = new SessionData(Target.NI);
    if (!runningTestsLocally()) {
      // Use this mock candidate having car test already booked.
      Constants.getNICandidateWithBookedTest(sessionData);
      await createNewBookingInCrm(sessionData);
    }
    t.ctx.sessionData = sessionData;

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${Target.NI}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await changeBookingPage.rescheduleTest();
  })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  })
  .meta('type', 'manage-booking');

test('Verify a candidate is able to change the time of their booking - NI', async (t) => {
  const { sessionData } = t.ctx;

  const chooseAppointment = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, `${changeBookingPage.pageHeading}`);
  await verifyContainsText(changeBookingPage.warningMessageLocator, `${changeBookingPage.refundWarningMessageText}`);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify a candidate is able to change the date and time of their booking - NI', async (t) => {
  const { sessionData } = t.ctx;

  const timeAndDateOnly = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  const chooseAppointment = await timeAndDateOnly.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, `${changeBookingPage.pageHeading}`);
  await verifyContainsText(changeBookingPage.warningMessageLocator, `${changeBookingPage.refundWarningMessageText}`);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify a candidate is able to change the location of their booking - NI', async (t) => {
  const { sessionData } = t.ctx;

  const findATheoryTestCentrePage = await whatDoYouWantToChangePage.selectLocationOnly();
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre('Newry');
  const preferredDatePage = await chooseATestCentrePage.selectATestCentre(sessionData.currentBooking.centre);
  const chooseAppointment = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, `${changeBookingPage.pageHeading}`);
  await verifyContainsText(changeBookingPage.warningMessageLocator, `${changeBookingPage.refundWarningMessageText}`);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});
