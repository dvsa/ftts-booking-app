import { PageNames } from '@constants';
import { TimeoutErrorController } from '@pages/error-timeout/error-timeout';
import { Locale, Target } from '../../../../src/domain/enums';
import { changeLanguageToLocale, sanitizeLocale } from '../../../../src/helpers/language';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'internationalised',
  changeLanguageToLocale: jest.fn(),
  isLocaleAvailableForTarget: () => true,
  sanitizeLocale: jest.fn(),
}));

describe('Error timeout controller', () => {
  let req;
  let res;
  let timeoutErrorController: TimeoutErrorController;

  beforeEach(() => {
    req = {
      hasErrors: false,
      query: {
        source: '/choose-support',
      },
      body: {},
      errors: [],
      session: {
        testCentreSearch: {},
        target: Target.GB,
        journey: {
          support: false,
          standardAccommodation: true,
        },
        currentBooking: {},
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        target: undefined,
      },
    };
    timeoutErrorController = new TimeoutErrorController();

    sanitizeLocale.mockImplementation((locale: Locale) => {
      switch (locale) {
        case Locale.NI: return Locale.NI;
        case Locale.CY: return Locale.CY;
        default: return Locale.GB;
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('should render timeout error page', async () => {
      await timeoutErrorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ERROR_TIMEOUT, {
        startAgainLink: '/choose-support?target=gb&lang=gb',
      });
    });

    test('should render timeout error page with start again link from instructor service', async () => {
      req.query.source = '/instructor/choose-appointment';

      await timeoutErrorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ERROR_TIMEOUT, {
        startAgainLink: '/instructor?target=gb&lang=gb',
      });
    });

    test('should render timeout error page with start again link from manage-booking', async () => {
      req.query.source = '/manage-booking/home';

      await timeoutErrorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ERROR_TIMEOUT, {
        startAgainLink: '/manage-booking?target=gb&lang=gb',
      });
    });

    test('NI context is preserved', async () => {
      req.query.target = Target.NI;
      req.query.lang = Locale.NI;

      await timeoutErrorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ERROR_TIMEOUT, {
        startAgainLink: '/choose-support?target=ni&lang=ni',
      });
      expect(res.locals.target).toStrictEqual(Target.NI);
      expect(changeLanguageToLocale).toHaveBeenCalledWith(req, res, Locale.NI);
    });

    test('Welsh language is preserved', async () => {
      req.query.target = Target.GB;
      req.query.lang = Locale.CY;

      await timeoutErrorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ERROR_TIMEOUT, {
        startAgainLink: '/choose-support?target=gb&lang=cy',
      });
      expect(res.locals.target).toStrictEqual(Target.GB);
      expect(changeLanguageToLocale).toHaveBeenCalledWith(req, res, Locale.CY);
    });

    test('session is reset', async () => {
      await timeoutErrorController.get(req, res);

      expect(req.session.candidate).toBeUndefined();
      expect(req.session.currentBooking).toBeUndefined();
    });
  });
});
