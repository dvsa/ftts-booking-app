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
    # Thank you for your driving theory test support request

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

    # You may need to provide evidence

    For some kinds of support you may be asked to provide evidence. This is usually a letter, email, diagnostic assessment or report from an educational or medical professional, an occupational therapist or an official organisation.

    ${optionalDeafCandidateSection(details)}

    # You can also contact us

    DVSA theory test enquiries
    Email: theorycustomerservices@dvsa.gov.uk
    Telephone: 0300 200 1122
    Monday to Friday, 8am to 4pm
  `,
};
