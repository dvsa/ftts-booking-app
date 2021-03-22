import * as Constants from '../data/constants';
import {
  verifyExactText, verifyIsVisible, runningTestsLocally, clearField, verifyTitleContainsText,
} from '../utils/helpers';
import { ManageBookingsPage } from '../pages/manage-bookings-page';
import { LoginPage } from '../pages/login-page';
import { TARGET } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';

const loginPage = new LoginPage();
const manageBookingsPage = new ManageBookingsPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;
const { drivingLicenceGB } = Constants;
const { drivingLicenceNI } = Constants;

fixture`Login`
  .page(`${pageUrl}?target=${TARGET.GB}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

test('Verify page title, heading and content are displayed correctly', async () => {
  await verifyTitleContainsText(`${loginPage.pageTitle} ${generalTitle}`);
  await verifyExactText(loginPage.pageTitleLocator, loginPage.pageHeading);
  await verifyExactText(loginPage.inputHeaderLocator, 'Booking reference', 0);
  await verifyExactText(loginPage.inputHeaderLocator, 'Driving licence number', 1);
  await verifyIsVisible(loginPage.bookingReferenceTextBox);
  await verifyIsVisible(loginPage.drivingLicenceTextBox);
  await verifyIsVisible(loginPage.submitButton);
});

test('Verify error prefix appears in the title when there is an error', async () => {
  await loginPage.submitDetails();
  await verifyTitleContainsText(`Error: ${loginPage.pageTitle} ${Constants.generalTitle}`);
});

test('Verify the user gets an error on submitting an empty form', async () => {
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageMissing);
});

test('Verify the user gets an error on submitting an empty booking reference field', async () => {
  const bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceGB;
  await loginPage.enterLoginDetails(bookingRef, drivingLicenceGB);
  await clearField(loginPage.bookingReferenceTextBox);
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageMissing);
});

test('Verify the user gets an error on submitting an empty driving licence field', async () => {
  const bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceGB;
  await loginPage.enterLoginDetails(bookingRef, drivingLicenceGB);
  await clearField(loginPage.drivingLicenceTextBox);
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageMissing);
});

test('Verify the user gets a validation error on submitting a invalidly formatted booking reference', async () => {
  await loginPage.enterLoginDetails('A000000001', drivingLicenceGB);
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
});

test('Verify the user gets a validation error on submitting a invalidly formatted driving licence (GB)', async () => {
  const bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceGB;
  await loginPage.enterLoginDetails(bookingRef, 'AAAA061102W97YT');
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
});

test('Verify the user gets a validation error on submitting a invalidly formatted driving licence (NI)', async (t) => {
  const bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceNI;
  await t.navigateTo(`${pageUrl}?target=${TARGET.NI}`);
  await loginPage.enterLoginDetails(bookingRef, '11223');
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
});

test('Verify the user can login using a valid booking reference and driving licence (GB)', async (t) => {
  const sessionData = new SessionData(TARGET.GB);
  let drivingLicence: string;
  let bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceGB;
  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    drivingLicence = drivingLicenceGB;
  }

  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
});

test('Verify the user can login using a valid booking reference and driving licence (NI)', async (t) => {
  const sessionData = new SessionData(TARGET.NI);
  let drivingLicence: string;
  let bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceNI;
  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    drivingLicence = drivingLicenceNI;
  }

  await t.navigateTo(`${pageUrl}?target=${TARGET.NI}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
});

test('Verify a NI candidate can login using a valid GB booking reference and driving licence (NI) on the DVSA service', async (t) => {
  const sessionData = new SessionData(TARGET.NI);
  let drivingLicence: string;
  let bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceNI;
  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    drivingLicence = drivingLicenceGB;
  }

  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
});

test('Verify a GB candidate cannot login using a valid GB booking reference and driving licence (GB) on the DVA service', async (t) => {
  const bookingRef = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceGB;
  await t.navigateTo(`${pageUrl}?target=${TARGET.NI}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicenceGB);
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
});

if (runningTestsLocally()) {
  test('Verify the user gets a validation error on submitting a valid booking reference and driving licence but they are not linked', async () => {
    await loginPage.enterLoginDetails('Z-000-000-001', drivingLicenceGB);
    await loginPage.submitDetails();
    await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
  });

  test('Verify the user can login using a booking reference for a previously passed test', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBPrevPassed);
    await loginPage.submitDetails();
    await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
  });

  test('Verify the user can login using a booking reference for a previously failed test', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBPrevFailed);
    await loginPage.submitDetails();
    await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
  });

  test('Verify the user can login using a valid booking created through the Customer Service Center', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBCSCBookingSuccess);
    await loginPage.submitDetails();
    await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
  });

  test('Verify the user is unable to login using a booking created through the Customer Service Center where the payment has failed', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBCSCBookingFailure);
    await loginPage.submitDetails();
    await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
  });
}
