import { ChooseSupportController } from '@pages/choose-support/choose-support';
import '../../../../src/helpers/language';
import { PageNames } from '@constants';
import { Locale, Target } from '../../../../src/domain/enums';
import config from '../../../../src/config';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mocked string',
}));

const gbGovLink = 'https://www.gov.uk';
const niGovLink = 'https://www.nidirect.gov.uk';

describe('Choose Support controller', () => {
  let chooseSupportController: ChooseSupportController;
  let req;
  let res;

  beforeEach(() => {
    chooseSupportController = new ChooseSupportController();
    req = {
      body: {
        chooseSupport: 'yes',
      },
      query: {
        newBooking: undefined,
      },
      errors: [],
      hasErrors: false,
      session: {
        journey: {
          inEditMode: false,
          support: false,
        },
        currentBooking: {},
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
      locals: {
        inEditMode: false,
        inManagedBookingEditMode: false,
      },
    };

    config.landing = {
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
        },
        instructor: {
          book: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
          manageBooking: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the view with correct data', () => {
      chooseSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_SUPPORT, {
        backLink: 'https://www.gov.uk/book-theory-test',
        booking: {},
        errors: [],
      });
    });

    test('renders the view with correct data when in edit mode', () => {
      req.session.journey.inEditMode = true;
      req.session.journey.standardAccommodation = true;
      chooseSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_SUPPORT, {
        backLink: 'check-your-answers',
        booking: {},
        errors: [],
      });
    });

    test('renders the view with correct error message', () => {
      req.errors.push({
        param: 'chooseSupport',
        msg: 'Yes or no',
      });

      chooseSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_SUPPORT, {
        backLink: 'https://www.gov.uk/book-theory-test',
        booking: {},
        errors: [{
          param: 'chooseSupport',
          msg: 'mocked string',
        }],
      });
    });

    test('throws error if journey is not set', () => {
      delete req.session.journey;

      expect(() => chooseSupportController.get(req, res)).toThrow(new Error('ChooseSupportController::get: No journey set'));
    });

    describe('back button navigation', () => {
      test('navigate back to gb gov book theory test start page', () => {
        chooseSupportController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_SUPPORT, expect.objectContaining({
          backLink: 'https://www.gov.uk/book-theory-test',
        }));
      });

      test('navigate back to gb gov book theory test start page with welsh language', () => {
        req.session.locale = Locale.CY;

        chooseSupportController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_SUPPORT, expect.objectContaining({
          backLink: 'https://www.gov.uk/archebu-prawf-gyrru-theori',
        }));
      });

      test('navigate back to NI gov book theory test start page if target is NI', () => {
        req.session.target = Target.NI;

        chooseSupportController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_SUPPORT, expect.objectContaining({
          backLink: 'https://www.nidirect.gov.uk/services/book-change-or-cancel-your-theory-test-online',
        }));
      });
    });
  });

  describe('POST', () => {
    test('redirects to the next page when answered yes', () => {
      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('support-alert');
      expect(req.session.journey.support).toEqual(false);
      expect(req.session.journey.standardAccommodation).toEqual(true);
    });

    test('redirects to the next page when answered no', () => {
      req.body.chooseSupport = 'no';
      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('candidate-details');
      expect(req.session.journey.support).toEqual(false);
      expect(req.session.journey.standardAccommodation).toEqual(true);
    });

    test('redirects to test type if in edit mode and selected support requested', () => {
      req.body.chooseSupport = 'yes';
      req.session.journey.inEditMode = true;

      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('nsa/test-type');
      expect(req.session.journey.support).toEqual(true);
      expect(req.session.journey.standardAccommodation).toEqual(false);
    });

    test('redirects to email contact if in edit mode and selected no support requested', () => {
      req.body.chooseSupport = 'no';
      req.session.journey.inEditMode = true;

      chooseSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('email-contact');
      expect(req.session.journey.support).toEqual(false);
      expect(req.session.journey.standardAccommodation).toEqual(true);
    });

    test('errors are displayed if in session', () => {
      req.hasErrors = true;
      req.errors.push({
        param: 'chooseSupport',
        msg: 'Yes or no',
      });

      chooseSupportController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_SUPPORT, {
        backLink: 'https://www.gov.uk/book-theory-test',
        booking: {},
        errors: [{
          param: 'chooseSupport',
          msg: 'mocked string',
        }],
      });
    });

    test('throws error if journey is not set', () => {
      delete req.session.journey;

      expect(() => chooseSupportController.get(req, res)).toThrow(new Error('ChooseSupportController::get: No journey set'));
    });
  });
});
