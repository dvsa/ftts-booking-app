import config from '../../../src/config';
import { Context, Locale, Target } from '../../../src/domain/enums';
import { getBackLinkToStartPage, getInstructorBackLinkToStartPage, getManageBookingLinkToStartPage } from '../../../src/helpers/start-page-navigator';

const gbGovLink = 'https://www.gov.uk';
const niGovLink = 'https://www.nidirect.gov.uk';

describe('Start page navigator', () => {
  let req;
  beforeEach(() => {
    req = {
      session: {
        testCentreSearch: {},
        journey: {
          inEditMode: false,
          support: false,
        },
        locale: Locale.GB,
        target: Target.GB,
        context: Context.CITIZEN,
      },
      body: {},
      errors: [],
      hasErrors: false,
    };

    config.landing = {
      enableInternalEntrypoints: false,
      gb: {
        citizen: {
          book: `${gbGovLink}/book-theory-test`,
          check: `${gbGovLink}/check-theory-test`,
          change: `${gbGovLink}/change-theory-test`,
          cancel: `${gbGovLink}/cancel-theory-test`,
        },
        instructor: {
          book: `${gbGovLink}/book-your-instructor-theory-test`,
          manageBooking: `${gbGovLink}/check-change-cancel-your-instructor-theory-test`,
        },
      },
      cy: {
        citizen: {
          book: `${gbGovLink}/archebu-prawf-gyrru-theori`,
        },
      },
      ni: {
        citizen: {
          book: `${niGovLink}/services/book-change-or-cancel-your-theory-test-online`,
          manageBooking: `${niGovLink}/services/book-change-or-cancel-your-theory-test-online`,
          compensationBook: `${niGovLink}/services/book-your-theory-test-online`,
        },
        instructor: {
          book: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
          manageBooking: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
        },
      },
    };
  });

  describe('getBackLinkToStartPage', () => {
    test('go back to gov uk book a theory test', () => {
      const url = getBackLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.gov.uk/book-theory-test');
    });

    test('go back to gov uk book a theory test with welsh language', () => {
      req.session.locale = Locale.CY;

      const url = getBackLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.gov.uk/archebu-prawf-gyrru-theori');
    });

    test('go back to nidirect book a theory test when target equals NI', () => {
      req.session.target = Target.NI;

      const url = getBackLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.nidirect.gov.uk/services/book-change-or-cancel-your-theory-test-online');
    });
  });

  describe('getManageBookingLinkToStartPage', () => {
    test('go back to gov uk change a theory test', () => {
      const url = getManageBookingLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.gov.uk/change-theory-test');
    });

    test('go back to nidirect change a theory test when target equals NI', () => {
      req.session.target = Target.NI;

      const url = getManageBookingLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.nidirect.gov.uk/services/book-change-or-cancel-your-theory-test-online');
    });

    test('go back to gov uk instructor change a theory test', () => {
      req.session.context = Context.INSTRUCTOR;

      const url = getManageBookingLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.gov.uk/check-change-cancel-your-instructor-theory-test');
    });

    test('go back to nidirect instructor change a theory test when target equals NI', () => {
      req.session.target = Target.NI;
      req.session.context = Context.INSTRUCTOR;

      const url = getManageBookingLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.nidirect.gov.uk/services/adi-theory-test-part-one-hazard-perception-test');
    });
  });

  describe('getInstructorBackLinkToStartPage', () => {
    test('go back to gov uk instructor book a theory test', () => {
      req.session.context = Context.INSTRUCTOR;

      const url = getInstructorBackLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.gov.uk/book-your-instructor-theory-test');
    });

    test('go back to nidirect instructor book a theory test when target equals NI', () => {
      req.session.target = Target.NI;
      req.session.context = Context.INSTRUCTOR;

      const url = getInstructorBackLinkToStartPage(req);

      expect(url).toStrictEqual('https://www.nidirect.gov.uk/services/adi-theory-test-part-one-hazard-perception-test');
    });
  });
});
