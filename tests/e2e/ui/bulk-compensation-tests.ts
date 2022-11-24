import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import { LoginPage } from '../pages/login-page';
import {
  runningTestsLocally, setAcceptCookies,
} from '../utils/helpers';
import {
  Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';

const loginPage = new LoginPage();

const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture.skip`Bulk Compensation Bookings (creation for manual testing)`
  .page(pageUrl)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .meta('type', 'manage-booking');

test('SA Candidate OBP booking - GB - Email', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.centre.accountId = 'f3f5a7c8-937d-ea11-a811-00224801bc51';
  sessionData.currentBooking.origin = Origin.CitizenPortal;
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.candidate.licenceNumber = 'SARAH357247RT4PA';
  sessionData.candidate.firstnames = 'Sarah';
  sessionData.candidate.surname = 'Part';
  sessionData.candidate.dateOfBirth = '2002-11-10';

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  console.log(`${bookingRef} ${drivingLicence} ${sessionData.currentBooking.dateTime}`);
});

test('SA Instructor OBP booking - GB - Email', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.centre.accountId = 'f3f5a7c8-937d-ea11-a811-00224801bc51';
  sessionData.currentBooking.origin = Origin.CitizenPortal;
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.candidate.licenceNumber = 'PAULF152143RS8IV';
  sessionData.candidate.firstnames = 'Paul';
  sessionData.candidate.surname = 'Drive';
  sessionData.candidate.dateOfBirth = '2002-11-10';

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  console.log(`${bookingRef} ${drivingLicence} ${sessionData.currentBooking.dateTime}`);
});

test('SA Candidate OBP booking - NI - Email', async () => {
  const sessionData = new SessionData(Target.NI);
  sessionData.currentBooking.centre.accountId = 'b1f6a7c8-937d-ea11-a811-00224801bc51';
  sessionData.currentBooking.origin = Origin.CitizenPortal;
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.candidate.licenceNumber = '48139612';
  sessionData.candidate.firstnames = 'Sarah';
  sessionData.candidate.surname = 'Part';
  sessionData.candidate.dateOfBirth = '2002-11-10';

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  console.log(`${bookingRef} ${drivingLicence} ${sessionData.currentBooking.dateTime}`);
});

test('SA Instructor OBP booking - NI - Email', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  sessionData.currentBooking.centre.accountId = 'b1f6a7c8-937d-ea11-a811-00224801bc51';
  sessionData.currentBooking.origin = Origin.CitizenPortal;
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.candidate.licenceNumber = '74563326';
  sessionData.candidate.firstnames = 'Paul';
  sessionData.candidate.surname = 'Drive';
  sessionData.candidate.dateOfBirth = '2002-11-10';

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  console.log(`${bookingRef} ${drivingLicence} ${sessionData.currentBooking.dateTime}`);
});

test('SA Candidate CSC booking - GB', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.centre.accountId = 'f3f5a7c8-937d-ea11-a811-00224801bc51';
  sessionData.currentBooking.origin = Origin.CustomerServiceCentre;
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.candidate.licenceNumber = 'SARAH357247RT4PA';
  sessionData.candidate.firstnames = 'Sarah';
  sessionData.candidate.surname = 'Part';
  sessionData.candidate.dateOfBirth = '2002-11-10';

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  console.log(`${bookingRef} ${drivingLicence} ${sessionData.currentBooking.dateTime}`);
});

test('NSA Candidate OBP booking - GB', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false);
  sessionData.currentBooking.centre.accountId = 'f3f5a7c8-937d-ea11-a811-00224801bc51';
  sessionData.currentBooking.origin = Origin.CitizenPortal;
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.candidate.licenceNumber = 'SARAH357247RT4PA';
  sessionData.candidate.firstnames = 'Sarah';
  sessionData.candidate.surname = 'Part';
  sessionData.candidate.dateOfBirth = '2002-11-10';

  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  sessionData.currentBooking.customSupport = 'Please arrange for the support';
  sessionData.currentBooking.voicemail = true;
  sessionData.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
  sessionData.currentBooking.preferredDay = 'I only want to have tests on Mondays';
  sessionData.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
  sessionData.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  console.log(`${bookingRef} ${licenceNumber} ${sessionData.currentBooking.dateTime}`);
});
