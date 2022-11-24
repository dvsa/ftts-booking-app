import dedent from 'ts-dedent';

import { SupportType } from '../../../../../domain/enums';
import { isDeafCandidate } from '../../../../../helpers/evidence-helper';
import { translate } from '../../../../../helpers/language';
import { SupportRequestDetails } from '../../../types';
import { escapeNotifyMarkdown, formatSupportTypes } from '../../helpers';

const optionalDeafCandidateSection = (details: SupportRequestDetails): string => {
  if (isDeafCandidate(details.supportTypes) && details.supportTypes.includes(SupportType.EXTRA_TIME)) {
    return dedent`
      # When you don't need to provide evidence

      You don't need to provide evidence if you are deaf or have a hearing impairment and asked for support related to deafness, as well as extra time. If you asked for any other type of support you will need to provide evidence.
    `;
  }
  return '';
};

export default {
  subject: 'DVSA: your theory test support request',
  buildBody: (details: SupportRequestDetails): string => dedent`
    # Send us evidence now to complete your support request

    Your request will not be processed until this evidence is received.

    # Your reference ${details.reference}

    Keep this reference safe. You will need it if you need to talk to us. It may be useful to print this email.

    # Important

    We are currently responding to a high number of enquiries and we will contact you as soon as possible to arrange your theory test.

    # Your test and support details

    Test type: ${translate(`generalContent.testTypes.${details.testType}`)}
    On-screen language: ${translate(`generalContent.language.${details.testLanguage}`)}
    Support requested: ${details.supportTypes.length > 0 ? translate('generalContent.yes') : translate('generalContent.no')}
    Support types you selected: ${formatSupportTypes(details.supportTypes)}
    Preferred time for test: ${details.preferredDay.text ? escapeNotifyMarkdown(details.preferredDay.text) : 'I will decide this later'}
    Preferred locations for test: ${details.preferredLocation.text ? escapeNotifyMarkdown(details.preferredLocation.text) : 'I will decide this later'}

    # What you must do now

    # Email your evidence

    Email your evidence documents to: theorytestsupport@dvsa.gov.uk

    You can send as many documents as you need to provide evidence.

    # Important

    To help speed up your support request, include your:
    1. support request reference ${details.reference}
    2. full name
    3. driving licence number

    # Other ways to send evidence

    Alternatively, you can post your evidence to:

    Driver and Vehicle Standards Agency
    PO Box 349
    Newcastle upon Tyne
    NE12 2GN

    ${optionalDeafCandidateSection(details)}

    # Your evidence

    Make sure your evidence:

    * is a letter, email, diagnostic assessment or report
    * is from an educational or medical professional, an occupational therapist or a relevant organisation
    * confirms your condition
    *  includes your first and last names
    * is signed and on headed paper if it is a letter of a report

    You can learn more about evidence on the government's website here: https://www.gov.uk/theory-test/reading-difficulty-disability-or-health-condition

    # When we receive your evidence

    We will check your evidence to make sure it enables you to get the right support. We will contact you when we have done this.

    # You can also contact us

    DVSA theory test enquiries
    Email: theorycustomerservices@dvsa.gov.uk
    Telephone: 0300 200 1122
    Monday to Friday, 8am to 4pm
  `,
};
