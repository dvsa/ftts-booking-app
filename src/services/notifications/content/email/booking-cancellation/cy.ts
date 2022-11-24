import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { BookingCancellationDetails } from '../../../types';
import { asLocalTime, asFullDateWithWeekday } from '../../../../../nunjucks-filters/local-date-time-filter';

export default {
  subject: 'DVSA: mae\'ch prawf theori gyrru wedi\'i ganslo',
  buildBody: (details: BookingCancellationDetails): string => dedent`
    # Mae'ch prawf theori gyrru ${translate(`generalContent.testTypes.${details.testType}`)} wedi'i ganslo

    # Cyfeirnod archeb ${details.bookingRef}

    Rydym wedi canslo'r prawf theori gyrru roeddech i'w sefyll am ${asLocalTime(details.testDateTime)} dydd ${asFullDateWithWeekday(details.testDateTime)}.

    ---
    Os nad oeddech wedi canslo'r prawf hwn, cysylltwch â ni ar unwaith. Gallwch ymateb i'r e-bost hwn neu ffonio ${translate('generalContent.cancelContact.phone')}.

    Bydd profion sy'n cael eu dileu mwy na 3 diwrnod gwaith clir cyn dyddiad y prawf yn cael eu had-dalu.

    ---
    # Archebu prawf arall
    Gallwch archebu prawf theori gyrru yma:
    https://www.gov.uk/book-theory-test

    ---
    # Paratoi ar gyfer y prawf
    Dysgwch fwy am baratoi ar gyfer prawf theori car gan gynnwys profion ymarfer am ddim yma:
    https://www.gov.uk/theory-test/revision-and-practice

    ---
    https://www.gov.uk/browse/driving/learning-to-drive
  `,
};
