import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { BookingCancellationDetails } from '../../../types';
import { asLocalTime, asFullDateWithWeekday } from '../../../../../nunjucks-filters/local-date-time-filter';
import { INSTRUCTOR_TEST_TYPES } from '../../../../../domain/eligibility';

export default {
  subject: 'DVA: your driving theory test has been cancelled',
  buildBody: (details: BookingCancellationDetails): string => {
    let bookTheoryTestLink = translate('generalContent.footer.bookingLinkUrl');
    let prepareForTestUrl = 'https://www.nidirect.gov.uk/articles/preparing-theory-test';
    if (INSTRUCTOR_TEST_TYPES.includes(details.testType)) {
      bookTheoryTestLink = translate('generalContent.footer.instructorBookingLinkUrl');
      prepareForTestUrl = 'https://www.nidirect.gov.uk/information-and-services/driving-living/driving-instructors';
    }
    return dedent`
    # Your ${translate(`generalContent.testTypes.${details.testType}`)} driving theory test is cancelled

    # Booking reference ${details.bookingRef}

    We've cancelled the driving theory test you were due to take at ${asLocalTime(details.testDateTime)} on ${asFullDateWithWeekday(details.testDateTime)}

    ---
    If you did not cancel this test please contact us immediately. You can reply to this email or telephone ${translate('generalContent.cancelContact.phone')}.

    Tests cancelled more than 3 clear working days before the test date will be refunded.

    ---
    # Booking another test
    You can book a driving theory test here:
    ${bookTheoryTestLink};

    ---
    # Prepare for a test
    Learn more about preparing for a car theory test including free practice tests here: ${prepareForTestUrl}

    ---
  `;
  },
};
