import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { BookingRescheduledDetails } from '../../../types';
import { asLocalTime, asFullDateWithWeekday, asFullDateWithoutWeekday } from '../../../../../nunjucks-filters/local-date-time-filter';
import { formatAddressLines } from '../../helpers';

export default {
  subject: 'DVSA: your driving theory test has been updated',
  buildBody: (details: BookingRescheduledDetails): string => {
    let cancelWarning = '';
    if (details.lastRefundDate) {
      cancelWarning = ` If this booking is changed or cancelled after ${asFullDateWithoutWeekday(details.lastRefundDate)} no refund will be made.`;
    }

    return dedent`
    # Your driving theory test details have been updated

    # Booking reference ${details.bookingRef}

    Keep these details safe. It may be useful to print this email and put the details in your calendar.

    If you did not update this test please contact us immediately. You can reply to this email or telephone 0300 2001122.

    ---
    # Test type

    ${translate(`generalContent.testTypes.${details.testType}`)}

    ---
    # Test Time and date

    ${asLocalTime(details.testDateTime)} on ${asFullDateWithWeekday(details.testDateTime)}

    ---
    # Test location
    ${formatAddressLines(details.testCentre)}

    ---
    # Important
    The person taking the test must:
    1. arrive 15 minutes before the test start time
    2. bring their driving licence
    (Old-style, paper licence-holders should also bring a valid passport)

    ^ Your test will be cancelled and you may not get your money back if you do not take the right things with you

    ---
    # Security at the test centre
    All test centres are security monitored.

    As you enter the test room, you'll be checked for items that could be used to cheat. Your test will not go ahead if you do not allow this check.

    ^ It is illegal to cheat in a theory test. You can be sent to prison and banned from driving.

    ---
    # Personal belongings
    When you arrive at the test centre, all devices should be switched off and personal items must be placed in the secure locker provided.

    Items include but are not limited to:
    * food and drink
    * earpieces or headphones
    * mobile phones and other electronic devices
    * hats, bags and coats
    * watches
    * books and revision notes

    Large items cannot be stored in our test centres.

    As part of our security checks, you may be asked to remove or adjust outer clothing, personal belongings or accessories.

    If you cannot store all your items or are found to have any of these items in the test room:
    * your test may be stopped and voided
    * you may be asked to leave
    * the test fee may not be refunded

    ---
    # No waiting facilities
    Test Centres have no waiting facilities for any adults or children accompanying candidates.

    ---
    # Prepare for the test
    Learn more about preparing for a car theory test including free practice tests here: https://www.gov.uk/theory-test/revision-and-practice.

    ---
    # Checking, rescheduling or cancelling this theory test
    Theory tests can be moved or cancelled up to 3 clear working days before without penalty.${cancelWarning}

    Check the details of this test here:
    https://www.gov.uk/check-theory-test

    Reschedule the test here:
    https://www.gov.uk/change-theory-test

    Cancel this test here:
    https://www.gov.uk/cancel-theory-test

    ---

    https://www.gov.uk/browse/driving/learning-to-drive
  `;
  },
};
