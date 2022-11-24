/* eslint-disable no-return-assign */
/* eslint-disable dot-notation */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, ClientFunction } from 'testcafe';
import * as Constants from '../data/constants';
import { verifyIsVisible, setCookie } from '../utils/helpers';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { Locale, SupportType, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { determineEvidenceRoute } from '../utils/evidence-helper';

const bookingConfirmationPage = new BookingConfirmationPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${bookingConfirmationPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

// mock out the print page function call to avoid browser issues
const mockPrintFunction = ClientFunction(() => { window.print = () => window['printOpened'] = true; });
const isPrintOpened = ClientFunction(() => window['printOpened'] === true);

fixture`Non-Standard Accommodations confirmation`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    const sessionData = new SessionData(Target.GB, Locale.GB, true);
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
    t.ctx.sessionData = sessionData;
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify NSA request details and headers are displayed correctly - Evidence required', async (t) => {
  const { sessionData } = t.ctx;
  const evidencePath = determineEvidenceRoute(sessionData.currentBooking.selectSupportType, false);
  await bookingConfirmationPage.checkDataMatchesSessionNSA(sessionData, evidencePath);
});

test('Verify NSA request details and headers are displayed correctly - Evidence not required', async (t) => {
  const { sessionData } = t.ctx;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);
  const evidencePath = determineEvidenceRoute(sessionData.currentBooking.selectSupportType, false);
  await bookingConfirmationPage.checkDataMatchesSessionNSA(sessionData, evidencePath);
});

test('Verify NSA request details and headers are displayed correctly - Evidence maybe required', async (t) => {
  const { sessionData } = t.ctx;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.OTHER];
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);
  const evidencePath = determineEvidenceRoute(sessionData.currentBooking.selectSupportType, false);
  await bookingConfirmationPage.checkDataMatchesSessionNSA(sessionData, evidencePath);
});

test('Verify the print page link appears and works correctly', async (t) => {
  // Print page link does not appear in IE11
  if (t.browser.name.toLowerCase() !== 'internet explorer') {
    await mockPrintFunction();
    await verifyIsVisible(bookingConfirmationPage.printPageLink);
    await bookingConfirmationPage.printPage();
    await t.expect(isPrintOpened()).ok();
  } else {
    console.log('Test skipped for IE11');
  }
});
