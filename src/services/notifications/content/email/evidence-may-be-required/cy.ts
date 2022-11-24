import dedent from 'ts-dedent';

import { SupportType } from '../../../../../domain/enums';
import { isDeafCandidate } from '../../../../../helpers/evidence-helper';
import { translate } from '../../../../../helpers/language';
import { SupportRequestDetails } from '../../../types';
import { escapeNotifyMarkdown, formatSupportTypes } from '../../helpers';

const optionalDeafCandidateSection = (details: SupportRequestDetails): string => {
  if (isDeafCandidate(details.supportTypes) && details.supportTypes.includes(SupportType.EXTRA_TIME)) {
    return dedent`
      # Pryd nad oes angen i chi ddarparu tystiolaeth

      Nid oes angen i chi ddarparu tystiolaeth os ydych yn fyddar neu os oes gennych nam ar y clyw ac yn gofyn am gymorth yn ymwneud â byddardod, yn ogystal ag amser ychwanegol. Os gwnaethoch ofyn am unrhyw fath arall o gymorth bydd angen i chi ddarparu tystiolaeth. ))
    `;
  }
  return '';
};

export default {
  subject: 'DVSA: eich cais am gymorth am eich prawf theori',
  buildBody: (details: SupportRequestDetails): string => dedent`
    # Diolch am eich cais am gymorth gyda'ch prawf theori gyrru

    # Eich cyfeirnod  ${details.reference}

    Cadwch y cyfeirnod hwn yn ddiogel. Bydd ei angen arnoch os oes angen i chi siarad â ni. Gall fod yn ddefnyddiol argraffu'r e-bost hwn.

    # Pwysig

    Ar hyn o bryd rydym yn ymateb i nifer fawr o ymholiadau ond byddwn yn cysylltu â chi cyn gynted â phosibl er mwyn trefnu eich prawf theori.

    # Eich manylion prawf a chymorth

    Math o brawf: ${translate(`generalContent.testTypes.${details.testType}`)}
    Iaith ar sgrîn: ${translate(`generalContent.language.${details.testLanguage}`)}
    Cymorth sydd angen: ${details.supportTypes.length > 0 ? translate('generalContent.yes') : translate('generalContent.no')}
    Y mathau o gymorth a ddewiswyd: ${formatSupportTypes(details.supportTypes)}
    Amser sy'n well gennych ar gyfer y prawf: ${details.preferredDay.text ? escapeNotifyMarkdown(details.preferredDay.text) : 'Byddaf yn gwneud y penderfyniad hwn yn hwyrach'}
    Y lleoliadau sy'n well gennych ar gyfer y prawf: ${details.preferredLocation.text ? escapeNotifyMarkdown(details.preferredLocation.text) : 'Byddaf yn gwneud y penderfyniad hwn yn hwyrach'}

    # Achosion pan nad oes angen i chi ddarparu tystiolaeth

    Ar gyfer rhai mathau o gymorth efallai y gofynnir i chi i ddarparu tystiolaeth. Mae hwn fel arfer ar ffurf llythyr, e-bost, asesiad diagnostig neu adroddiad gan weithiwr proffesiynol addysgol neu feddygol, therapydd galwedigaethol neu sefydliad swyddogol.

    ${optionalDeafCandidateSection(details)}

    # Gallwch hefyd gysylltu â ni

    Ymholiadau prawf theori DVSA
    E-bost: theorycustomerservices@dvsa.gov.uk
    Ffôn: 0300 200 1122
    Dydd Llun I ddydd Gwener, 8yb i 4yh
  `,
};
