import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { BookingCancellationDetails } from '../../../types';
import { asLocalTime, asFullDateWithWeekday } from '../../../../../nunjucks-filters/local-date-time-filter';

export default {
  subject: 'DVSA: your driving theory test has been cancelled',
  buildBody: (details: BookingCancellationDetails): string => dedent`
    # Your ${translate(`generalContent.testTypes.${details.testType}`)} driving theory test is cancelled

    # Booking reference ${details.bookingRef}

    We've cancelled the driving theory test you were due to take at ${asLocalTime(details.testDateTime)} on ${asFullDateWithWeekday(details.testDateTime)}

    ---
    If you did not cancel this test please contact us immediately. You can reply to this email or telephone ${translate('generalContent.cancelContact.phone')}.

    Tests cancelled more than 3 clear working days before the test date will be refunded.

    ---
    # Booking another test
    You can book a driving theory test here:
    https://www.gov.uk/book-theory-test

    ---
    # Prepare for a test
    Learn more about preparing for a car theory test including free practice tests here: https://www.gov.uk/theory-test/revision-and-practice

    ---
    https://www.gov.uk/browse/driving/learning-to-drive
  `,
};
