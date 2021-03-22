import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { BookingConfirmationDetails } from '../../../types';
import { asLocalTime, asFullDateWithWeekday, asFullDateWithoutWeekday } from '../../../../../nunjucks-filters/local-date-time-filter';
import { formatAddressLines } from '../../helpers';

export default {
  subject: 'DVA: details of your confirmed driving theory test appointment',
  buildBody: (details: BookingConfirmationDetails): string => {
    let cancelWarning = '';
    if (details.lastRefundDate) {
      cancelWarning = ` If this booking is changed or cancelled after ${asFullDateWithoutWeekday(details.lastRefundDate)} no refund will be made.`;
    }

    return dedent`
    # Your driving theory test is confirmed
    # Booking reference  ${details.bookingRef}

    Keep these details safe. It may be useful to print this email and put the details in your calendar.

    ---
    # Test type
    ${translate(`generalContent.testTypes.${details.testType}`)}

    ---
    # Test time and date
    ${asLocalTime(details.testDateTime)} on ${asFullDateWithWeekday(details.testDateTime)}

    ---
    # Test location
    ${formatAddressLines(details.testCentre)}

    ---
    # Important
    The person taking the test must:
    1. arrive 15 minutes before the test start time
    2. bring their driving licence (Old-style, paper licence-holders should also bring a valid passport)

    ^ Your test will be cancelled and you may not get your money back if you do not take the right things with you

    ---
    # Security at the test centre
    All test centres are security monitored.

    As you enter the test room, you'll be checked for items that could be used to cheat.

    Your test will not go ahead if you do not allow this check.

    ^ It is illegal to cheat in a theory test. You can be sent to prison and banned from driving.

    ---
    # Personal belongings
    When you arrive at the test centre, all personal items must be placed in the secure locker provided. These items include:
    * food and drink
    * ear-pieces or headphones
    * mobile phones and other electronic devices
    * hats, bags and coats
    * watches
    * books and revision notes

    If you are found to have any of these items in the test room:
    * your test may be stopped and voided
    * you may be asked to leave
    * the test fee may not be refunded

    ---
    # No waiting facilities
    Test centres have no waiting facilities for any adults or children accompanying candidates.

    ---
    # Prepare for the test
    Learn more about preparing for a car theory test including free practice tests here: https://www.nidirect.gov.uk/articles/preparing-theory-test.

    ---
    # Checking, rescheduling or cancelling this theory test
    Theory tests can be moved or cancelled up to 3 days before without penalty.${cancelWarning}

    Check, reschedule or cancel this test here: https://www.nidirect.gov.uk/services/book-change-or-cancel-your-theory-test-online

    ---
  `;
  },
};