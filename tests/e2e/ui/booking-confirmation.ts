/* eslint-disable no-return-assign */
/* eslint-disable dot-notation */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, ClientFunction } from 'testcafe';
import * as Constants from '../data/constants';
import { verifyIsVisible, setCookie } from '../utils/helpers';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';

const bookingConfirmationPage = new BookingConfirmationPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${bookingConfirmationPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});
let sessionData: SessionData;

// mock out the print page function call to avoid browser issues
const mockPrintFunction = ClientFunction(() => { window.print = () => window['printOpened'] = true; });
const isPrintOpened = ClientFunction(() => window['printOpened'] === true);

fixture`Booking confirmation`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    sessionData = new SessionData(Target.GB);
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title, heading, booking confirmation message, email address, reference number, test time and date, test location and other headers are displayed correctly', async () => {
  await bookingConfirmationPage.checkDataMatchesSession(sessionData);
});

test('Verify preparing for a car theory test link is working correctly', async () => {
  await bookingConfirmationPage.preparingForTheTheoryTest();
});

test('Verify change the time of this test link is working correctly', async () => {
  await bookingConfirmationPage.changeTheTimeOfThisTest();
});

test('Verify cancel the test link is working correctly', async () => {
  await bookingConfirmationPage.cancelTheTest();
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
