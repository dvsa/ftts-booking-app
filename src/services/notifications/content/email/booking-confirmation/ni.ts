import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { BookingConfirmationDetails } from '../../../types';
import { asLocalTime, asFullDateWithWeekday, asFullDateWithoutWeekday } from '../../../../../nunjucks-filters/local-date-time-filter';
import { formatAddressLines } from '../../helpers';
import { TestType } from '../../../../../domain/enums';
import { afterTheTest } from './helpers';

export default {
  subject: 'DVA: details of your confirmed driving theory test appointment',
  buildBody: (details: BookingConfirmationDetails): string => {
    let cancelWarning = '';
    if (details.lastRefundDate) {
      cancelWarning = ` If this booking is changed or cancelled after ${asFullDateWithoutWeekday(details.lastRefundDate)} no refund will be made.`;
    }
    let provingIdentitySecondBullet = 'your valid signed GB photocard licence showing your provisional enitlement, and a printed summary (dated within a week of your test date) of your driving licence record from [www.gov.uk/view-driving-licence](https://www.gov.uk/view-driving-licence)';
    let additionalStatementCandidate = 'If your GB photocard licence does not show your provisional entitlement you must obtain written confirmation from the DVLA of your provisional entitlement.';
    let prepareForTestUrl = 'https://www.nidirect.gov.uk/articles/preparing-theory-test';
    let checkChangeCancelUrl = 'https://www.nidirect.gov.uk/services/change-or-cancel-your-theory-test-online';

    const dvaInstructorTestTypes: TestType[] = [TestType.ADIP1DVA, TestType.AMIP1];
    if (dvaInstructorTestTypes.includes(details.testType)) {
      provingIdentitySecondBullet = 'your valid signed GB photocard licence and a printed summary (dated within a week of your test date) of your driving licence record from [www.gov.uk/view-driving-licence](https://www.gov.uk/view-driving-licence)';
      additionalStatementCandidate = '';
      prepareForTestUrl = 'https://www.nidirect.gov.uk/information-and-services/driving-living/driving-instructors';
      checkChangeCancelUrl = 'https://www.nidirect.gov.uk/services/change-or-cancel-your-adi-or-ami-theory-test-online';
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
    Make sure you arrive 15 minutes before your test time. This is to sign in, prove your identity and get ready for the test.

    You must comply with the test centre COVID-19 safety measures and wearing of face coverings which can be checked here - [Coronavirus (Covid 19) and motoring](https://www.nidirect.gov.uk/articles/coronavirus-covid-19-and-motoring)

    ---
    # Proving your identity
    You must bring these items to your test:
    * both parts of your valid signed Northern Ireland driving licence (photocard and paper counterpart) or
    * ${provingIdentitySecondBullet}

    ${additionalStatementCandidate}

    If you have an old style non-photographic licence, you must bring acceptable photographic evidence of your identity as well as your licence. You can learn more about which types of photographic ID are acceptable on the government's website, [www.nidirect.gov.uk/motoring](https://www.nidirect.gov.uk/motoring).

    ^ Your test may be cancelled and you could lose your fee if you are late or do not bring the right documents with you

    ---
    # Security at the test centre
    All test centres are security monitored.

    As you enter the test room, you'll be checked for items that could be used to cheat.

    Your test will not go ahead if you do not allow this check.

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
    [Learn more about preparing for a car theory test including free practice tests](${prepareForTestUrl}).

    ${afterTheTest()}
    
    ---
    # Checking, changing or cancelling this theory test
    Theory tests can be moved or cancelled up to 3 clear working days before without penalty.${cancelWarning}

    [Check, change or cancel this test here](${checkChangeCancelUrl})

    ---
  `;
  },
};
