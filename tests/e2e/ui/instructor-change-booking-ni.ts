import * as Constants from '../data/constants';
import {
  Locale, Target, TestType,
} from '../../../src/domain/enums';
import {
  runningTestsLocally, setAcceptCookies, verifyContainsText, verifyTitleContainsText, click,
} from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { SessionData } from '../data/session-data';
import { LoginPage } from '../pages/login-page';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { CheckChangePage } from '../pages/check-change-page';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const loginPage = new LoginPage();
const changeBookingPage = new ChangeBookingPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Instructor - Change Booking - NI`
  .page(`${pageUrl}?target=${Target.NI}`)
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

test('Verify the UI contents of Change booking page for tests greater than 3 days away for an instructor - ADI P1', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.ADIP1DVA;
  sessionData.candidate.paymentReceiptNumber = '92647';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.niInstructorRescheduleWarningMessageText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
});

test('Verify the UI contents of Change booking page for tests greater than 3 days away for an instructor - AMI P1', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.AMIP1;
  sessionData.candidate.paymentReceiptNumber = '95436';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-002';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.niInstructorRescheduleWarningMessageText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
});

test('Verify an instructor candidate is able to change the time of their booking', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.ADIP1DVA;
  sessionData.candidate.paymentReceiptNumber = '92647';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

  const reschedulePage = await changeBookingPage.rescheduleTest();
  const chooseAppointment = await reschedulePage.selectTimeOnly();
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  const checkChange = new CheckChangePage();
  const changeConfirmedPage = new ChangeConfirmedPage();
  await checkChange.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.niInstructorRescheduleWarningMessageText);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify an instructor candidate is able to change the date and time of their booking', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.ADIP1DVA;
  sessionData.candidate.paymentReceiptNumber = '92647';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

  const reschedulePage = await changeBookingPage.rescheduleTest();
  const timeAndDateOnly = await reschedulePage.selectTimeAndDateOnly();
  const chooseAppointment = await timeAndDateOnly.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  const checkChange = new CheckChangePage();
  const changeConfirmedPage = new ChangeConfirmedPage();
  await checkChange.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.niInstructorRescheduleWarningMessageText);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify an instructor candidate is able to change the location of their booking', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.ADIP1DVA;
  sessionData.candidate.paymentReceiptNumber = '92647';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

  const reschedulePage = await changeBookingPage.rescheduleTest();
  const findATheoryTestCentrePage = await reschedulePage.selectLocationOnly();
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre('Newry');
  const preferredDatePage = await chooseATestCentrePage.selectATestCentre(sessionData.currentBooking.centre);
  const chooseAppointment = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  const checkChange = new CheckChangePage();
  const changeConfirmedPage = new ChangeConfirmedPage();
  await checkChange.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.niInstructorRescheduleWarningMessageText);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});
