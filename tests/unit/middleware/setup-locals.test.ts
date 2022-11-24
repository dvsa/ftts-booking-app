import MockDate from 'mockdate';
import config from '../../../src/config';
import { Locale, Target } from '../../../src/domain/enums';
import { setupLocals } from '../../../src/middleware/setup-locals';

describe('setupLocals', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    MockDate.set('2020-11-11T14:30:00.000Z');
    req = {
      session: {},
    };
    res = {
      locals: {},
    };
    next = jest.fn();
    config.sessionTimeoutWarningMinutes = 5; // 5 mins
    config.sessionTtlSessionDuration = 1800; // 30 mins
    config.landing.gb.citizen.book = 'gb-booking-url';
    config.landing.cy.citizen.book = 'cy-booking-url';
  });

  afterEach(() => {
    MockDate.reset();
  });

  test('correctly configures response.locals when session data exists', () => {
    req.session = {
      cookie: {
        expires: '2020-11-11T15:00:45.979Z',
      },
      target: Target.NI,
      locale: Locale.GB,
      journey: {
        inEditMode: true,
        inManagedBookingEditMode: false,
        standardAccommodation: false,
        isInstructor: true,
      },
    };

    setupLocals(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals).toStrictEqual({
      target: Target.NI,
      imgRoot: 'images/ni/',
      inEditMode: true,
      inSupportMode: false,
      inManageBookingMode: false,
      standardAccommodation: false,
      isInstructor: true,
      expiryDelay: 1800,
      notificationDelay: 1500,
      source: undefined,
      headerLink: config.landing.gb.citizen.book,
      journeyName: 'nsa-instructor',
      organisation: 'dva',
    });
  });

  test('correctly configures the header link when locale is set to welsh', () => {
    req.session.locale = Locale.CY;

    setupLocals(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals.headerLink).toBe(config.landing.cy.citizen.book);
  });

  test('correctly configures response.locals when session data is missing', () => {
    setupLocals(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals).toStrictEqual({
      target: Target.GB,
      imgRoot: 'images/',
      inEditMode: undefined,
      inSupportMode: undefined,
      standardAccommodation: undefined,
      inManageBookingMode: undefined,
      isInstructor: undefined,
      source: undefined,
      headerLink: config.landing.gb.citizen.book,
      journeyName: undefined,
      organisation: 'dvsa',
    });
  });
});
