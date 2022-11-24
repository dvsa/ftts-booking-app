import dedent from 'ts-dedent';

import { translate } from '../../../../../helpers/language';
import { BookingConfirmationDetails } from '../../../types';
import { asLocalTime, asFullDateWithWeekday, asFullDateWithoutWeekday } from '../../../../../nunjucks-filters/local-date-time-filter';
import { formatAddressLines } from '../../helpers';
import { afterTheTest } from './helpers';

export default {
  subject: 'DVSA: manylion eich apwyntiad prawf theori gyrru wedi\'i gadarnhau',
  buildBody: (details: BookingConfirmationDetails): string => {
    let cancelWarning = '';
    if (details.lastRefundDate) {
      cancelWarning = ` Os bydd yr archeb hon yn cael ei newid neu'i chanslo ar ôl dydd ${asFullDateWithoutWeekday(details.lastRefundDate)} ni roddir ad-daliad.`;
    }

    return dedent`
    # Cadarnheir eich prawf theori gyrru
    # Cyfeirnod archeb ${details.bookingRef}

    Cadwch y manylion hyn yn ddiogel. Gall fod yn ddefnyddiol argraffu'r e-bost hwn a rhoi'r manylion yn eich calendr.

    ---
    # Math o brawf
    ${translate(`generalContent.testTypes.${details.testType}`)}

    ---
    # Amser a dyddiad y prawf
    ${asLocalTime(details.testDateTime)} on ${asFullDateWithWeekday(details.testDateTime)}

    ---
    # Lleoliad y prawf
    ${formatAddressLines(details.testCentre)}

    ---
    # Pwysig
    Mae'n rhaid i'r unigolyn sy'n sefyll y prawf:
    1. gyrraedd 15 munud cyn amser cychwyn y prawf
    2. dod â'u trwydded yrru (dylai deiliaid sy'n berchen ar yr hen ddull o drwydded papur hefyd ddod â phasport dilys)

    ^ Bydd eich prawf yn cael ei ganslo ac efallai na chewch eich arian yn ôl os na fyddwch yn dod â'r pethau cywir gyda chi

    ---
    # Diogelwch yn y ganolfan prawf
    Monitrir diogelwch ym mhob canolfan prawf.

    Wrth i chi fynd i mewn i'r ystafell prawf, gwirir nad oes eitemau gennych y gellid eu defnyddio i dwyllo.

    Ni fydd eich prawf yn cael ei gynnal os na fyddwch yn caniatáu i’r gwiriad hwn ddigwydd.

    ^ Mae'n anghyfreithlon twyllo mewn prawf theori. Gallwch gael eich anfon i'r carchar a'ch gwahardd rhag gyrru.

    ---
    # Eiddo personol
    Pan fyddwch yn cyrraedd y ganolfan brawf, dylai pob dyfais gael eu diffodd ac mae'n rhaid rhoi eitemau personol yn y locer diogel a ddarperir.

    Mae eitemau'n cynnwys ond heb fod yn gyfyngedig i:
    * bwyd a diod
    * darnau clust neu glustffonau
    * ffonau symudol a dyfeisiau electronig arall
    * hetiau, bagiau a chotiau
    * watshis
    * llyfrau a nodiadau adolygu

    Ni ellir storio eitemau mawr yn ein canolfannau prawf.

    Fel rhan o'n gwiriadau diogelwch, efallai y gofynnir i chi dynnu i ffwrdd neu addasu dillad allanol, eiddo personol neu ategolion.

    Os na allwch storio'ch holl eitemau neu os canfyddir bod gennych unrhyw un o'r eitemau hyn yn yr ystafell brawf:
    * mae'n bosibl y bydd eich prawf yn cael ei atal a'i ddirymu
    * mae'n bosibl y gofynnir i chi adael
    * mae'n bosibl na ad-delir ffi'r prawf

    ---
    # Dim cyfleusterau aros
    Nid oes gan ganolfannau prawf gyfleusterau aros ar gyfer unrhyw oedolion na phlant sy'n dod gydag ymgeiswyr.

    ---
    # Paratoi ar gyfer y prawf
    Dysgwch fwy am baratoi ar gyfer prawf theori car gan gynnwys profion ymarfer am ddim yma: https://www.gov.uk/theory-test/revision-and-practice.
    
    ${afterTheTest()}

    ---
    # Gwirio, aildrefnu neu ganslo'r prawf theori hwn
    Gellir symud neu ganslo profion theori hyd at 3 niwrnod cyn y prawf heb gosb.${cancelWarning}

    Gwiriwch fanylion y prawf hwn yma: https://www.gov.uk/check-theory-test

    Aildrefnwch y prawf yma: https://www.gov.uk/change-theory-test

    Canslwch y prawf hwn yma: https://www.gov.uk/cancel-theory-test

    ---
  `;
  },
};
