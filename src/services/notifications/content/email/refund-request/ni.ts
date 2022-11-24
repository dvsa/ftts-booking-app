import dedent from 'ts-dedent';
import { translate } from '../../../../../helpers/language';
import { RefundRequestDetails } from '../../../types';

export default {
  subject: 'DVA: Your driving theory test refund request has been received',
  buildBody: (details: RefundRequestDetails): string => dedent`
  # We have received your driving theory test refund request

  ---
  # Cancelled theory test booking reference: ${details.bookingRef}
  ---

  Your refund request for a cancelled driving theory test has been received.

  # What happens next

  Refunds are sent to the account used for the original payment.

  You can book a new theory test at https://www.nidirect.gov.uk/services/book-your-theory-test-online

  If you are a driving instructor, use: https://www.nidirect.gov.uk/services/book-your-adi-or-ami-theory-test-online

  # DVA theory test booking support

  dva.theorycustomerservices@dvsa.gov.uk
  Telephone: ${translate('generalContent.cancelContact.phone')}
  Monday to Friday, 8am to 4pm (except public holidays)
  `,
};
