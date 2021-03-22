/* eslint-disable security/detect-non-literal-regexp */
import * as Constants from '../data/constants';
import { CancelBookingPage } from '../pages/cancel-booking-page';
import { CancelledBookingPage } from '../pages/cancelled-booking-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import { ManageBookingsPage } from '../pages/manage-bookings-page';
import { SessionData } from '../data/session-data';
import {
  capitalizeFirstLetter, convertDateToDisplayFormat, convertTimeToDisplayFormat, runningTestsLocally, verifyContainsText, verifyExactText, verifyIsNotVisible, verifyTitleContainsText,
} from '../utils/helpers';
import { LOCALE, TARGET } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { generalTitle } from '../data/constants';

const cancelBookingPage = new CancelBookingPage();
const cancelledBookingPage = new CancelledBookingPage();
const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const manageBookingsPage = new ManageBookingsPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Cancelled booking`
  .page(pageUrl)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    const sessionData = new SessionData(TARGET.GB);
    if (!runningTestsLocally()) {
      await new NavigationHelper(sessionData).createANewBooking();
    }
    t.ctx.sessionData = sessionData;

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await manageBookingsPage.viewTestWithBookingReference(bookingRef);
    await changeBookingPage.cancelTest();
    await cancelBookingPage.confirmCancellation();
  })
  .meta('type', 'e2e');

test('Verify UI contents of the Cancelled theory test booking page', async (t) => {
  const { sessionData } = t.ctx;
  const { bookingRef } = sessionData.currentBooking;

  await verifyTitleContainsText(`${cancelledBookingPage.pageTitle} ${generalTitle}`);
  await verifyExactText(cancelledBookingPage.pageTitleLocator, cancelledBookingPage.pageHeading);
  await verifyContainsText(cancelledBookingPage.refNumberLocator, cancelledBookingPage.refNumberText);
  await verifyContainsText(cancelledBookingPage.refNumberLocator, bookingRef);
  await verifyExactText(cancelledBookingPage.messageLocator, cancelledBookingPage.messageText);
  await verifyExactText(cancelledBookingPage.bookANewTestButtonLocator, cancelledBookingPage.bookANewTestButtonText);
  await verifyExactText(cancelledBookingPage.changeAnotherBookingButtonLocator, cancelledBookingPage.changeAnotherBookingButtonText);

  // field names
  await verifyExactText(cancelledBookingPage.testDetailsKey, 'Test type', 0);
  await verifyExactText(cancelledBookingPage.testDetailsKey, 'Test time and date', 1);
  await verifyExactText(cancelledBookingPage.testDetailsKey, 'Test location', 2);

  // field values
  await verifyExactText(cancelledBookingPage.testDetailsValue, capitalizeFirstLetter(sessionData.currentBooking.testType), 0);

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
  await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
});

test('Verify book a new test button takes you to the \'Get the right support page\'', async () => {
  const chooseSupportPage = await cancelledBookingPage.bookANewTest();
  await verifyExactText(chooseSupportPage.pageTitleLocator, chooseSupportPage.pageHeading);
});

if (!runningTestsLocally()) { // only run against an environment due to data constraints
  test('Verify when a booking is cancelled, you can no longer login with that booking', async (t) => {
    const { sessionData } = t.ctx;
    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;

    await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
    await loginPage.enterLoginDetails(bookingRef, drivingLicence);
    await loginPage.submitDetails();
    await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
  });

  test('Verify when a booking is cancelled, it is no longer displayed in manage booking list', async (t) => {
    const { sessionData } = t.ctx;
    const { bookingRef } = sessionData.currentBooking;
    await cancelledBookingPage.changeAnotherBooking();
    await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
    const changeButton = manageBookingsPage.changeBookingWithReference.replace('<BookingReference>', bookingRef);
    await verifyIsNotVisible(changeButton);
  });
}
