/* eslint-disable security/detect-non-literal-regexp */
import { TARGET } from '../../../src/domain/enums';
import * as Constants from '../data/constants';
import { generalTitle } from '../data/constants';
import { CancelBookingPage } from '../pages/cancel-booking-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import { ManageBookingsPage } from '../pages/manage-bookings-page';
import {
  verifyExactText, runningTestsLocally, verifyTitleContainsText,
} from '../utils/helpers';

const cancelBookingPage = new CancelBookingPage();
const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const manageBookingsPage = new ManageBookingsPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

let bookingRef: string;
const drivingLicence = Constants.drivingLicenceGB;

fixture`Cancel booking`
  .page(pageUrl)
  .before(async () => {
    await Constants.setRequestTimeout;
    bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceGB;
  })
  .meta('type', 'regression');

test('Verify UI contents of the Cancel this theory test booking page', async (t) => {
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await verifyTitleContainsText(`${cancelBookingPage.pageTitle} ${generalTitle}`);
  await verifyExactText(cancelBookingPage.pageTitleLocator, cancelBookingPage.pageHeading);
  await verifyExactText(cancelBookingPage.cancelButtonLocator, cancelBookingPage.confirmCancellationButtonText);
  await verifyExactText(cancelBookingPage.keepButtonLocator, cancelBookingPage.keepExistingBookingButtonText);
  await verifyExactText(cancelBookingPage.messageLocator, cancelBookingPage.messageText, 2);
  await verifyExactText(cancelBookingPage.keepButtonLocator, cancelBookingPage.keepExistingBookingButtonText);
  await verifyExactText(cancelBookingPage.textLocator1, cancelBookingPage.text1);
  await verifyExactText(cancelBookingPage.messageLocator, cancelBookingPage.text2, 3);
  await verifyExactText(cancelBookingPage.textLocator3, cancelBookingPage.text3);
  await verifyExactText(cancelBookingPage.textLocator4, cancelBookingPage.text4);
  await verifyExactText(cancelBookingPage.messageLocator, cancelBookingPage.text5, 4);
  await verifyExactText(cancelBookingPage.textLocator6, cancelBookingPage.text6);
});

test('Verify keep existing button takes you to the Change theory test booking page', async (t) => {
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await cancelBookingPage.keepExistingBooking();
  await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
});

test('Verify the Back link takes you to the Change theory test booking page', async (t) => {
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.cancelTest();
  await cancelBookingPage.goBack();
  await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
});
