import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import {
  verifyExactText, verifyContainsText, runningTestsLocally, click, verifyTitleContainsText, setAcceptCookies,
} from '../utils/helpers';
import {
  Language, Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';
import { CheckChangePage } from '../pages/check-change-page';
import { generalTitle, generalTitleNI } from '../data/constants';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { WhatDoYouWantToChangePage } from '../pages/what-do-you-want-to-change-page';
import { CRMTestSupportNeed } from '../../../src/services/crm-gateway/enums';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const whatDoYouWantToChangePage = new WhatDoYouWantToChangePage();
const checkChangePage = new CheckChangePage();
const changeConfirmedPage = new ChangeConfirmedPage();

const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Change booking - Customer Service Centre created bookings`
  .page(pageUrl)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .meta('type', 'manage-booking');

test('Verify a candidate is able to manage their CSC Standard Accommodations booking', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.origin = Origin.CustomerServiceCentre;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(`${changeBookingPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});

test('Verify a candidate is able to reschedule the time, date and location of their CSC Standard Accommodations booking', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.origin = Origin.CustomerServiceCentre;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

  await changeBookingPage.rescheduleTest();
  const findTheoryTestCentrePage = await whatDoYouWantToChangePage.selectLocationOnly();
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectANewTestCentre(sessionData.currentBooking.centre);
  const chooseAppointmentPageAgain = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPageAgain.chooseAppointment(sessionData.currentBooking, 1);

  // check the change page
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.viewAllBookingsButton);
  await ManageBookingsPage.viewTestWithBookingReference(sessionData.currentBooking.bookingRef);
  // check new confirmed changes are now displayed
  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

// Not applicable for NI bookings
const dataSetLanguage = [
  {
    testName: 'GB CSC SA bookings no Elig bypass',
    eligibilityBypass: false,
  },
  {
    testName: 'GB CSC SA bookings Elig bypass',
    eligibilityBypass: true,
  },
];

dataSetLanguage.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Change Language for ${data.testName} - verify new Language is displayed and saved when confirming change`, async () => {
    const sessionData = new SessionData(Target.GB);
    sessionData.currentBooking.language = Language.ENGLISH;
    sessionData.currentBooking.origin = Origin.CustomerServiceCentre;
    sessionData.currentBooking.eligibilityBypass = data.eligibilityBypass;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    sessionData.currentBooking.language = Language.WELSH; // change language to welsh
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    const languagePage = await changeBookingPage.changeTestLanguage();
    await languagePage.selectTestLanguage(Constants.Languages.get(sessionData.currentBooking.language));

    // check the change page
    await verifyTitleContainsText(`${checkChangePage.pageHeading} ${generalTitle}`);
    await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
    await checkChangePage.checkUpdatedLanguage(sessionData);
    await checkChangePage.confirmChange();

    // confirmation page
    await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
    await click(changeConfirmedPage.makeAnotherChangeButton);

    // back on change booking page
    await verifyExactText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
    // check new confirmed changes are now displayed
    if (!runningTestsLocally()) {
      await changeBookingPage.checkDataMatchesSession(sessionData);
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  });
});

const dataSetVoiceover = [
  {
    testName: 'GB CSC SA bookings no Elig bypass',
    target: Target.GB,
    locale: Locale.GB,
    eligibilityBypass: false,
  },
  {
    testName: 'NI CSC SA bookings no Elig bypass',
    target: Target.NI,
    locale: Locale.NI,
    eligibilityBypass: false,
  },
  {
    testName: 'GB CSC SA bookings Elig bypass',
    target: Target.GB,
    locale: Locale.GB,
    eligibilityBypass: true,
  },
  {
    testName: 'NI CSC SA bookings Elig bypass',
    target: Target.NI,
    locale: Locale.NI,
    eligibilityBypass: true,
  },
];

dataSetVoiceover.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Change Voiceover for ${data.testName} - verify new Voiceover is displayed when confirming change`, async (t) => {
    const sessionData = new SessionData(data.target);
    sessionData.currentBooking.origin = Origin.CustomerServiceCentre;
    sessionData.currentBooking.eligibilityBypass = data.eligibilityBypass;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    sessionData.currentBooking.voiceover = Voiceover.WELSH; // change voiceover to welsh
    if (data.target === Target.NI) {
      sessionData.currentBooking.voiceover = Voiceover.PORTUGUESE; // change language to portuguese
    }
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
    await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

    // check the change page
    await checkChangePage.checkUpdatedVoiceover(sessionData);
    await checkChangePage.confirmChange();

    // confirmation page
    await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
    await click(changeConfirmedPage.makeAnotherChangeButton);
    // check new confirmed changes are now displayed
    if (!runningTestsLocally()) {
      await changeBookingPage.checkDataMatchesSession(sessionData);
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  });
});

const dataSetBsl = [
  {
    description: 'GB CSC SA no elig bypass - from Yes to No',
    target: Target.GB,
    locale: Locale.GB,
    oldBsl: true,
    newBsl: false,
    eligibilityBypass: false,
  },
  {
    description: 'GB CSC SA no elig bypass - from No to Yes',
    target: Target.GB,
    locale: Locale.GB,
    oldBsl: false,
    newBsl: true,
    eligibilityBypass: false,
  },
  {
    description: 'NI CSC SA no elig bypass - from Yes to No',
    target: Target.NI,
    locale: Locale.NI,
    oldBsl: true,
    newBsl: false,
    eligibilityBypass: false,
  },
  {
    description: 'NI CSC SA no elig bypass - from No to Yes',
    target: Target.NI,
    locale: Locale.NI,
    oldBsl: false,
    newBsl: true,
    eligibilityBypass: false,
  },
  {
    description: 'GB CSC SA elig bypass - from Yes to No',
    target: Target.GB,
    locale: Locale.GB,
    oldBsl: true,
    newBsl: false,
    eligibilityBypass: true,
  },
  {
    description: 'GB CSC SA elig bypass - from No to Yes',
    target: Target.GB,
    locale: Locale.GB,
    oldBsl: false,
    newBsl: true,
    eligibilityBypass: true,
  },
  {
    description: 'NI CSC SA elig bypass - from Yes to No',
    target: Target.NI,
    locale: Locale.NI,
    oldBsl: true,
    newBsl: false,
  },
  {
    description: 'NI CSC SA elig bypass - from No to Yes',
    target: Target.NI,
    locale: Locale.NI,
    oldBsl: false,
    newBsl: true,
    eligibilityBypass: true,
  },
];

dataSetBsl.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Change BSL for - ${data.description} - verify new BSL selection is displayed when confirming change`, async (t) => {
    const sessionData = new SessionData(data.target);
    sessionData.currentBooking.origin = Origin.CustomerServiceCentre;
    sessionData.currentBooking.eligibilityBypass = data.eligibilityBypass;
    sessionData.currentBooking.bsl = data.oldBsl;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    sessionData.currentBooking.bsl = data.newBsl; // change BSL
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    const bslPage = await changeBookingPage.changeRequestBsl();
    await bslPage.selectBslRequired(sessionData.currentBooking.bsl);

    // check the change page
    await verifyTitleContainsText(`${checkChangePage.pageHeading}`);
    await verifyContainsText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
    await checkChangePage.checkUpdatedBsl(sessionData);
    await checkChangePage.confirmChange();

    // confirmation page
    await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
    await click(changeConfirmedPage.makeAnotherChangeButton);

    // back on change booking page
    await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);

    if (!runningTestsLocally()) {
      await changeBookingPage.checkDataMatchesSession(sessionData);
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  });
});

const dataSet = [
  {
    testName: 'GB Bookings',
    target: Target.GB,
    locale: Locale.GB,
    warningMessage: changeBookingPage.noChangeAllowedTextDVSA,
    title: generalTitle,
  },
  {
    testName: 'NI Bookings',
    target: Target.NI,
    locale: Locale.NI,
    warningMessage: changeBookingPage.noChangeAllowedTextDVA,
    title: generalTitleNI,
  },
];

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify candidate is NOT able to change their NSA booking and Test Support needs are shown - ${data.testName}`, async (t) => {
    const sessionData = new SessionData(data.target);
    sessionData.currentBooking.origin = Origin.CitizenPortal;
    sessionData.journey.standardAccommodation = false;
    sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
    sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
    sessionData.currentBooking.customSupport = 'Please arrange for the support';
    sessionData.currentBooking.voicemail = true;
    sessionData.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
    sessionData.currentBooking.preferredDay = 'I only want to have tests on Mondays';
    sessionData.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
    sessionData.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';

    if (data.target === Target.GB) {
      sessionData.currentBooking.testSupportNeeds = [CRMTestSupportNeed.SpecialTestingEquipment, CRMTestSupportNeed.HomeTest, CRMTestSupportNeed.SeperateRoom];
    } else {
      sessionData.currentBooking.testSupportNeeds = [CRMTestSupportNeed.SpecialTestingEquipment, CRMTestSupportNeed.SeperateRoom, CRMTestSupportNeed.ForeignLanguageInterpreter];
      sessionData.currentBooking.translator = 'Spanish';
    }

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await verifyTitleContainsText(`${changeBookingPage.pageHeading} ${data.title}`);
    await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, data.warningMessage);

    await changeBookingPage.checkDataMatchesSession(sessionData);
    await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.NON_STANDARD_BOOKING);

    if (!runningTestsLocally()) {
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  });
});

test('Verify a candidate is NOT able to reschedule their booking if CSC has overridden eligibility', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.origin = Origin.CustomerServiceCentre;
  sessionData.currentBooking.eligibilityBypass = true;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(`${changeBookingPage.pageHeading} ${generalTitle}`);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.ELIGIBILITY_OVERRIDE);

  if (!runningTestsLocally()) {
    const { bookingProductId } = sessionData.currentBooking;
    await crmGateway.cleanUpBookingProducts(bookingProductId);
  }
});
