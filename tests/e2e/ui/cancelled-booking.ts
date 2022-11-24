/* eslint-disable security/detect-non-literal-regexp */
import { CancelBookingPage } from '../pages/cancel-booking-page';
import { CancelledBookingPage } from '../pages/cancelled-booking-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { SessionData } from '../data/session-data';
import {
  convertDateToDisplayFormat, convertTimeToDisplayFormat, runningTestsLocally, setAcceptCookies, verifyContainsText, verifyExactText, verifyIsNotVisible, verifyTitleContainsText,
} from '../utils/helpers';
import { Target } from '../../../src/domain/enums';
import {
  generalTitle, MAX_TIMEOUT, TestTypeName, setRequestTimeout,
} from '../data/constants';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';

const cancelBookingPage = new CancelBookingPage();
const cancelledBookingPage = new CancelledBookingPage();
const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Cancelled booking`
  .page(pageUrl)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async (t) => {
    await setAcceptCookies();
    const sessionData = new SessionData(Target.GB);
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }
    t.ctx.sessionData = sessionData;

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await changeBookingPage.cancelTest();
    await cancelBookingPage.confirmCancellation();
    await verifyTitleContainsText(`${cancelledBookingPage.pageHeading} ${generalTitle}`, MAX_TIMEOUT); // syncronisation point
  })
  .meta('type', 'manage-booking');

test('Verify UI contents of the Cancelled theory test booking page', async (t) => {
  const { sessionData } = t.ctx;
  const { bookingRef } = sessionData.currentBooking;
  await verifyExactText(cancelledBookingPage.pageHeadingLocator, cancelledBookingPage.pageHeading);
  await verifyContainsText(cancelledBookingPage.refNumberLocator, cancelledBookingPage.refNumberText);
  await verifyContainsText(cancelledBookingPage.refNumberLocator, bookingRef);
  await verifyExactText(cancelledBookingPage.messageLocator, cancelledBookingPage.messageText);
  // This test will be activated after the transition period
  // await verifyExactText(cancelledBookingPage.bookANewTestButtonLocator, cancelledBookingPage.bookANewTestButtonText);
  await verifyExactText(cancelledBookingPage.changeAnotherBookingButtonLocator, cancelledBookingPage.changeAnotherBookingButtonText);

  // field names
  await verifyExactText(cancelledBookingPage.testDetailsKey, 'Test type', 0);
  await verifyExactText(cancelledBookingPage.testDetailsKey, 'Test time and date', 1);
  await verifyExactText(cancelledBookingPage.testDetailsKey, 'Test location', 2);

  // field values
  await verifyExactText(cancelledBookingPage.testDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), 0);

  const sessionTestTimeDate = new Date(sessionData.currentBooking.dateTime);
  const expTestTime = convertTimeToDisplayFormat(sessionTestTimeDate);
  await verifyContainsText(changeBookingPage.testDetailsValue, expTestTime, 1);
  const expTestDate = convertDateToDisplayFormat(sessionTestTimeDate);
  await verifyContainsText(changeBookingPage.testDetailsValue, expTestDate, 1);
  await verifyContainsText(changeBookingPage.testDetailsValue, sessionData.currentBooking.centre.name, 2);
  await verifyContainsText(changeBookingPage.testDetailsValue, sessionData.currentBooking.centre.addressLine1, 2);
  if (sessionData.currentBooking.centre.addressLine2) {
    await verifyContainsText(changeBookingPage.testDetailsValue, sessionData.currentBooking.centre.addressLine2, 2);
  }
  await verifyContainsText(changeBookingPage.testDetailsValue, sessionData.currentBooking.centre.addressCity, 2);
  await verifyContainsText(changeBookingPage.testDetailsValue, sessionData.currentBooking.centre.addressPostalCode, 2);
});

test('Verify change another booking button takes you to the manage booking page', async () => {
  await cancelledBookingPage.changeAnotherBooking();
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
});

if (!runningTestsLocally()) { // only run against an environment due to data constraints
  test('Verify when a booking is cancelled, you can no longer login with that booking', async (t) => {
    const { sessionData } = t.ctx;
    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;

    await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
    await loginPage.enterLoginDetails(bookingRef, drivingLicence);
    await loginPage.submitDetails();
    await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
  });

  test('Verify when a booking is cancelled, it is no longer displayed in manage booking list', async (t) => {
    const { sessionData } = t.ctx;
    const { bookingRef } = sessionData.currentBooking;
    await cancelledBookingPage.changeAnotherBooking();
    await verifyContainsText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
    const changeButton = ManageBookingsPage.changeBookingWithReference.replace('<BookingReference>', bookingRef);
    await verifyIsNotVisible(changeButton);
  });
}
