import * as Constants from '../data/constants';
import {
  verifyExactText, verifyIsVisible, runningTestsLocally, clearField, verifyTitleContainsText, verifyContainsText, setAcceptCookies,
} from '../utils/helpers';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { LoginPage } from '../pages/login-page';
import { Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

const loginPage = new LoginPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;
const { drivingLicenceGB } = Constants;
const { drivingLicenceNI } = Constants;

fixture`Login`
  .page(`${pageUrl}?target=${Target.GB}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .meta('type', 'manage-booking');

test('Verify page title, heading and content are displayed correctly', async () => {
  await verifyTitleContainsText(`${loginPage.pageHeading} ${generalTitle}`);
  await verifyExactText(loginPage.pageHeadingLocator, loginPage.pageHeading);
  await verifyExactText(loginPage.inputHeaderLocator, 'Booking reference', 0);
  await verifyExactText(loginPage.inputHeaderLocator, 'Driving licence number', 1);
  await verifyIsVisible(loginPage.bookingReferenceTextBox);
  await verifyIsVisible(loginPage.drivingLicenceTextBox);
  await verifyIsVisible(loginPage.submitButton);
});

test('Verify error prefix appears in the title when there is an error', async () => {
  await loginPage.submitDetails();
  await verifyTitleContainsText('Error');
  await verifyTitleContainsText(`${loginPage.pageHeading} ${Constants.generalTitle}`);
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
  await t.navigateTo(`${pageUrl}?target=${Target.NI}`);
  await loginPage.enterLoginDetails(bookingRef, '11223');
  await loginPage.submitDetails();
  await verifyContainsText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
});

test('Verify the user can login using a valid booking reference and driving licence (GB)', async (t) => {
  const sessionData = new SessionData(Target.GB);
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    bookingRef = Constants.bookingReference1;
    drivingLicence = drivingLicenceGB;
  }

  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify the user can login using a valid booking reference and driving licence (GB) with white spaces as they are trimmed', async (t) => {
  const sessionData = new SessionData(Target.GB);
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    bookingRef = Constants.bookingReference1;
    drivingLicence = drivingLicenceGB;
  }

  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.enterLoginDetailsWithSpaces(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify the user can login using a valid booking reference and driving licence entered in lower case (GB)', async (t) => {
  const sessionData = new SessionData(Target.GB);
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = (sessionData.candidate.licenceNumber).toLowerCase();
  } else {
    bookingRef = Constants.bookingReference1;
    drivingLicence = drivingLicenceGB.toLowerCase();
  }

  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify the user can login using a valid booking reference and driving licence (NI)', async (t) => {
  const sessionData = new SessionData(Target.NI);
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    bookingRef = Constants.bookingReference1;
    drivingLicence = drivingLicenceNI;
  }

  await t.navigateTo(`${pageUrl}?target=${Target.NI}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyContainsText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify the user can login using a valid booking reference and driving licence (NI) with white spaces as they are trimmed', async (t) => {
  const sessionData = new SessionData(Target.NI);
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    bookingRef = Constants.bookingReference1;
    drivingLicence = drivingLicenceNI;
  }

  await t.navigateTo(`${pageUrl}?target=${Target.NI}`);
  await loginPage.enterLoginDetailsWithSpaces(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyContainsText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify a NI candidate cannot login using a valid NI booking reference and driving licence (NI) on the DVSA service', async (t) => {
  const sessionData = new SessionData(Target.NI);
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    bookingRef = Constants.bookingReference1;
    drivingLicence = drivingLicenceNI;
  }

  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify a NI candidate can login using a valid GB booking reference and driving licence (NI) on the DVSA service', async (t) => {
  const sessionData = new SessionData(Target.GB);
  sessionData.candidate.firstnames = Constants.nameNI;
  sessionData.candidate.surname = Constants.nameNI;
  sessionData.candidate.dateOfBirth = Constants.dob;
  sessionData.candidate.licenceNumber = Constants.drivingLicenceNI;
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    bookingRef = 'A-000-000-010';
    drivingLicence = Constants.drivingLicenceNIMultipleBookings;
  }

  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify a GB candidate cannot login using a valid GB booking reference and driving licence (GB) on the DVA service', async (t) => {
  const sessionData = new SessionData(Target.GB);
  let drivingLicence: string;
  let bookingRef: string;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
    bookingRef = sessionData.currentBooking.bookingRef;
    drivingLicence = sessionData.candidate.licenceNumber;
  } else {
    bookingRef = Constants.bookingReference1;
    drivingLicence = drivingLicenceGB;
  }

  await t.navigateTo(`${pageUrl}?target=${Target.NI}`);
  await loginPage.enterLoginDetails(bookingRef, drivingLicence);
  await loginPage.submitDetails();
  await verifyContainsText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

if (runningTestsLocally()) {
  test('Verify the user gets a validation error on submitting a valid booking reference and driving licence but they are not linked', async () => {
    await loginPage.enterLoginDetails('Z-000-000-001', drivingLicenceGB);
    await loginPage.submitDetails();
    await verifyContainsText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
  });

  test('Verify the user can login using a booking reference for a previously passed test', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBPrevPassed);
    await loginPage.submitDetails();
    await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
  });

  test('Verify the user can login using a booking reference for a previously failed test', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBPrevFailed);
    await loginPage.submitDetails();
    await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
  });

  test('Verify the user can login using a valid booking created through the Customer Service Center', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBCSCBookingSuccess);
    await loginPage.submitDetails();
    await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
  });

  test('Verify the user is unable to login using a booking created through the Customer Service Center where the payment has failed', async () => {
    const bookingRef = Constants.bookingReference1;
    await loginPage.enterLoginDetails(bookingRef, Constants.drivingLicenceGBCSCBookingFailure);
    await loginPage.submitDetails();
    await verifyExactText(loginPage.errorMessageLocator, loginPage.errorMessageValidation);
  });
}
