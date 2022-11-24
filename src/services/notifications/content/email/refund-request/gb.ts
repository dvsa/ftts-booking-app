import dedent from 'ts-dedent';
import { RefundRequestDetails } from '../../../types';

export default {
  subject: 'DVSA: Your driving theory test refund request has been received',
  buildBody: (details: RefundRequestDetails): string => dedent`
  # We have received your driving theory test refund request

  ---
  # Cancelled theory test booking reference: ${details.bookingRef}
  ---

  Your refund request for a cancelled driving theory test has been received.

  # What happens next

  Refunds are sent to the account used for the original payment.

  You can book a new theory test on GOV.UK at https://www.gov.uk/book-theory-test

  If you are a driving instructor, use: https://www.gov.uk/book-your-instructor-theory-test

  # DVSA theory test booking support

  TheoryCustomerServices@dvsa.gov.uk
  Telephone: 0300 200 1122
  Monday to Friday, 8am to 4pm (except public holidays)
  `,
};
