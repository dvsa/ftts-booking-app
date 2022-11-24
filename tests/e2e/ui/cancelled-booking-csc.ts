/* eslint-disable security/detect-non-literal-regexp */
import { CancelBookingPage } from '../pages/cancel-booking-page';
import { CancelledBookingPage } from '../pages/cancelled-booking-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { SessionData } from '../data/session-data';
import {
  runningTestsLocally, setAcceptCookies, verifyExactText, verifyTitleContainsText,
} from '../utils/helpers';
import { Origin, Target } from '../../../src/domain/enums';
import {
  generalTitle, MAX_TIMEOUT, setRequestTimeout,
} from '../data/constants';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';

const cancelBookingPage = new CancelBookingPage();
const cancelledBookingPage = new CancelledBookingPage();
const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Cancelled booking - Customer Service Centre created bookings`
  .page(pageUrl)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async () => {
    await setAcceptCookies();
  })
  .meta('type', 'manage-booking');

const dataSet = [
  {
    testName: 'No Eligibility bypass',
    eligibilityBypass: false,
  },
  {
    testName: 'With Eligibility bypass',
    eligibilityBypass: true,
  },
];

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify a candidate is able to cancel their CSC Standard Accommodations booking - ${data.testName}`, async (t) => {
    const sessionData = new SessionData(Target.GB);
    sessionData.currentBooking.origin = Origin.CustomerServiceCentre;
    sessionData.currentBooking.eligibilityBypass = data.eligibilityBypass;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await changeBookingPage.cancelTest();
    await cancelBookingPage.confirmCancellation();
    await verifyTitleContainsText(`${cancelledBookingPage.pageHeading} ${generalTitle}`, MAX_TIMEOUT);
    await verifyExactText(cancelledBookingPage.pageHeadingLocator, cancelledBookingPage.pageHeading);
  });
});
