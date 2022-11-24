import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { SupportRequestDetails } from '../../../types';
import { escapeNotifyMarkdown, formatSupportTypes } from '../../helpers';

export default {
  subject: 'DVA: your theory test support request',
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

    # You can also contact us

    DVSA theory test enquiries
    Email: dva.theorytestsupportni@dvsa.gov.uk
    Telephone: 0345 600 6700
    Monday to Friday, 8am to 4pm
  `,
};
