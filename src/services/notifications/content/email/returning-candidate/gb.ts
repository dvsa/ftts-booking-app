import dedent from 'ts-dedent';

import { SupportType } from '../../../../../domain/enums';
import { translate } from '../../../../../helpers/language';
import { SupportRequestDetails } from '../../../types';
import { formatSupportTypes } from '../../helpers';

const isSupportRequested = (supportTypes: SupportType[]) => {
  if (supportTypes.length) {
    return translate('generalContent.yes');
  }
  return translate('generalContent.no');
};

const getPreferredDayText = (preferredDayText: string | undefined) => {
  if (preferredDayText) {
    return preferredDayText;
  }
  return 'To be decided later';
};

const getPreferredLocationText = (preferredLocationText: string | undefined) => {
  if (preferredLocationText) {
    return preferredLocationText;
  }
  return 'To be decided later';
};

export default {
  subject: 'DVSA: your theory test support request',
  buildBody: (details: SupportRequestDetails): string => dedent`
    # Thank you for your driving theory test support request

    # Your reference ${details.reference}

    Keep this reference safe. You will need it to talk to us. It may be useful to print this email.

    # Important

    We are currently responding to a high number of enquiries and we will contact you as soon as possible to arrange your theory test.


    # Your test and support details

    Test type: ${translate(`generalContent.testTypes.${details.testType}`)}

    On-screen language: ${translate(`generalContent.language.${details.testLanguage}`)}

    Support requested: ${isSupportRequested(details.supportTypes)}

    Support types you selected: ${formatSupportTypes(details.supportTypes)}

    Preferred time for test: ${getPreferredDayText(details.preferredDay.text)}

    Preferred locations for test: ${getPreferredLocationText(details.preferredLocation.text)}


    # Evidence

    Some kinds of support require evidence. This is usually a letter, email, diagnostic assessment or report from an educational or medical professional, an occupational therapist or an official organisation.


    # If you've provided evidence before

    If you provided evidence for a theory test you failed, we don't need to see it again unless the support you need has changed.


    # You can also contact us

    DVSA theory test enquiries
    Email: [theorycustomerservices@dvsa.gov.uk](mailto:theorycustomerservices@dvsa.gov.uk)
    Telephone: 0300 200 1122
    Monday to Friday, 8am to 4pm
  `,
};
