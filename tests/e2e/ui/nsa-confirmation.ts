/* eslint-disable no-return-assign */
/* eslint-disable dot-notation */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, ClientFunction } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, verifyContainsText, verifyIsVisible, setCookie, verifyTitleContainsText,
} from '../utils/helpers';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';

const bookingConfirmationPage = new BookingConfirmationPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${bookingConfirmationPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], { logResponseHeaders: true });
let sessionData: SessionData;

// mock out the print page function call to avoid browser issues
const mockPrintFunction = ClientFunction(() => { window.print = () => window['printOpened'] = true; });
const isPrintOpened = ClientFunction(() => window['printOpened']);

fixture`Non-Standard Accommodations confirmation`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    sessionData = new SessionData(TARGET.GB);
    sessionData.journey.support = true;
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page content is displayed correctly', async () => {
  await verifyTitleContainsText(`${bookingConfirmationPage.pageTitle} ${Constants.generalTitle}`);
  await verifyExactText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingNSA);
  await verifyContainsText(bookingConfirmationPage.bookingConfirmationMessageLocator, bookingConfirmationPage.nsaConfirmationText);
  await verifyContainsText(bookingConfirmationPage.bookingConfirmationMessageLocator, bookingConfirmationPage.nsaReferenceText);
  await verifyExactText(bookingConfirmationPage.bookingReferenceLocatorNSA, 'HDJ2123F'); // mock booking ref for now as its a static page
  await verifyExactText(bookingConfirmationPage.headers, bookingConfirmationPage.headersText5, 0);
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
