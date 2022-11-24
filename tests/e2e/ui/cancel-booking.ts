/* eslint-disable security/detect-non-literal-regexp */
import { Target } from '../../../src/domain/enums';
import * as Constants from '../data/constants';
import { generalTitle } from '../data/constants';
import { SessionData } from '../data/session-data';
import { CancelBookingPage } from '../pages/cancel-booking-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import {
  verifyExactText, runningTestsLocally, verifyTitleContainsText, setAcceptCookies,
} from '../utils/helpers';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const cancelBookingPage = new CancelBookingPage();
const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Cancel booking`
  .page(pageUrl)
  .before(async () => {
    await Constants.setRequestTimeout;
  })
  .beforeEach(async (t) => {
    await setAcceptCookies();
    const sessionData = new SessionData(Target.GB);
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }
    t.ctx.sessionData = sessionData;
  })
  .meta('type', 'manage-booking');

test('Verify UI contents of the Cancel this theory test booking page', async (t) => {
  const { sessionData } = t.ctx;
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;

  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await verifyTitleContainsText(`${cancelBookingPage.pageHeading} ${generalTitle}`);
  await verifyExactText(cancelBookingPage.pageHeadingLocator, cancelBookingPage.pageHeading);
  await verifyExactText(cancelBookingPage.cancelButtonLocator, cancelBookingPage.confirmCancellationButtonText);
  await verifyExactText(cancelBookingPage.keepButtonLocator, cancelBookingPage.keepExistingBookingButtonText);
  await verifyExactText(cancelBookingPage.messageLocator, cancelBookingPage.messageText, 0);
  await verifyExactText(cancelBookingPage.keepButtonLocator, cancelBookingPage.keepExistingBookingButtonText);
  await verifyExactText(cancelBookingPage.textLocator1, cancelBookingPage.text1, 0);
  await verifyExactText(cancelBookingPage.textLocator4, cancelBookingPage.text2, 3);
  await verifyExactText(cancelBookingPage.textLocator3, cancelBookingPage.text3);
  await verifyExactText(cancelBookingPage.textLocator4, cancelBookingPage.text4, 4);
  await verifyExactText(cancelBookingPage.textLocator4, cancelBookingPage.text5, 5);
  await verifyExactText(cancelBookingPage.textLocator6, cancelBookingPage.text6);
  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify keep existing button takes you to the Change theory test booking page', async (t) => {
  const { sessionData } = t.ctx;
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;

  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await cancelBookingPage.keepExistingBooking();
  await verifyExactText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify the Back link takes you to the Change theory test booking page', async (t) => {
  const { sessionData } = t.ctx;
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;

  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await cancelBookingPage.goBack();
  await verifyExactText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});
