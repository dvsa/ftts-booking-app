import * as Constants from '../data/constants';
import { Locale, Target } from '../../../src/domain/enums';
import {
  runningTestsLocally, setAcceptCookies, verifyContainsText, verifyExactText, verifyTitleContainsText,
} from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { SessionData } from '../data/session-data';
import { LoginPage } from '../pages/login-page';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { CancelBookingPage } from '../pages/cancel-booking-page';
import { CancelledBookingPage } from '../pages/cancelled-booking-page';
import { ChangeBookingPage } from '../pages/change-booking-page';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const loginPage = new LoginPage();
const cancelBookingPage = new CancelBookingPage();
const cancelledBookingPage = new CancelledBookingPage();
const changeBookingPage = new ChangeBookingPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Instructor - Manage Booking`
  .page(`${pageUrl}?target=${Target.GB}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  })
  .meta('type', 'instructor');

test('Verify page title, heading and UI contents of Manage bookings page for an instructor', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);

  await verifyTitleContainsText(`${ManageBookingsPage.pageHeading}`);
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column1, 0);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column2, 1);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column3, 2);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column4, 3);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column5, 4);
  await verifyContainsText(ManageBookingsPage.bookedLabel, 'BOOKED');
});

test('Verify we can cancel an Instructor booking - GB', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
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
  await verifyTitleContainsText(`${cancelledBookingPage.pageHeading}`, Constants.MAX_TIMEOUT); // syncronisation point
});

test('Verify we can cancel an Instructor booking - NI', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }
  t.ctx.sessionData = sessionData;

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.NI}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await cancelBookingPage.confirmCancellation();
  await verifyTitleContainsText(`${cancelledBookingPage.pageHeading}`, Constants.MAX_TIMEOUT); // syncronisation point
});
