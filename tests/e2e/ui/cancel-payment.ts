import { RequestLogger, t } from 'testcafe';
import {
  generalTitle, generalTitleNI, setRequestTimeout,
} from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  verifyContainsText, verifyTitleContainsText, clickLinkContainsURL, setAcceptCookies, setCookie, getCurrentUrl,
} from '../utils/helpers';
import { CheckYourDetailsPage } from '../pages/check-your-details-page';
import { Locale, Target } from '../../../src/domain/enums';
import { PaymentsPage } from '../pages/payments-page';
import { BookingCancelledPage } from '../pages/booking-cancelled-page';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { createCandidateAndLicence } from '../utils/crm/crm-data-helper';

const checkYourDetailsPage = new CheckYourDetailsPage();
const paymentsPage = new PaymentsPage();
const bookingCancelledPage = new BookingCancelledPage();
const chooseSupportPage = new ChooseSupportPage();

// eslint-disable-next-line security/detect-non-literal-regexp
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Cancel Payment`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .meta('type', 'regression');

const dataSet = [
  {
    testName: 'GB candidate - English',
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    title: generalTitle,
    bookingCancelledHeading: bookingCancelledPage.pageHeading,
    startButtonText: bookingCancelledPage.startAgainButtonText,
    chooseSupportHeading: chooseSupportPage.pageHeading,
  },
  {
    testName: 'GB instructor - English',
    instructorBooking: true,
    target: Target.GB,
    locale: Locale.GB,
    title: generalTitle,
    bookingCancelledHeading: bookingCancelledPage.pageHeading,
    startButtonText: bookingCancelledPage.startAgainButtonText,
    chooseSupportHeading: chooseSupportPage.pageHeading,
  },
  {
    testName: 'NI candidate',
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    title: generalTitleNI,
    bookingCancelledHeading: bookingCancelledPage.pageHeading,
    startButtonText: bookingCancelledPage.startAgainButtonText,
    chooseSupportHeading: chooseSupportPage.pageHeading,
  },
];

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify when payment is cancelled, booking can be started again - ${data.testName}`, async () => {
    const sessionData = new SessionData(data.target, data.locale, false, data.instructorBooking, true);
    await createCandidateAndLicence(sessionData);
    await setCookie(headerLogger, sessionData);
    let pageUrl = `${process.env.BOOKING_APP_URL}/${checkYourDetailsPage.pathUrl}`;
    if (data.instructorBooking) {
      pageUrl = `${process.env.BOOKING_APP_URL}/instructor/${checkYourDetailsPage.pathUrl}`;
    }
    await t.navigateTo(pageUrl);
    await checkYourDetailsPage.continueBooking();
    await paymentsPage.cancelPayment(sessionData.paymentDetails);
    await verifyTitleContainsText(`${data.bookingCancelledHeading} ${data.title}`);
    await verifyContainsText(bookingCancelledPage.pageHeadingLocator, data.bookingCancelledHeading);

    const urlCandidate = `/choose-support?target=${data.target}&lang=${data.locale}`;
    const urlInstructor = `/instructor?target=${data.target}&lang=${data.locale}`;
    const startBookingAgainURL = data.instructorBooking ? urlInstructor : urlCandidate;
    await clickLinkContainsURL(data.startButtonText, startBookingAgainURL);
    await bookingCancelledPage.startBookingAgain();

    await verifyTitleContainsText(`${data.chooseSupportHeading}`);
    await verifyContainsText(chooseSupportPage.pageHeadingLocator, data.chooseSupportHeading);
    await t.expect(getCurrentUrl()).contains(startBookingAgainURL);
  });
});
