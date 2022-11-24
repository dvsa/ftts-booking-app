import * as i18n from '../../../src/middleware/internationalisation';
import { Locale, Target } from '../../../src/domain/enums';
import { changeLanguage, isLocaleAvailableForTarget, resetLocale } from '../../../src/helpers/language';

jest.mock('../../../src/helpers/language');

describe('Internationalisation middleware', () => {
  let res;
  let next;

  beforeEach(() => {
    const UnMockedisLocaleAvailableForTarget = jest.requireActual('../../../src/helpers/language').isLocaleAvailableForTarget;
    const UnMockedResetLocale = jest.requireActual('../../../src/helpers/language').resetLocale;
    isLocaleAvailableForTarget.mockImplementation(UnMockedisLocaleAvailableForTarget);
    resetLocale.mockImplementation(UnMockedResetLocale);

    res = {
      locals: {
        t: null,
      },
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Sets language', async () => {
    const req = {
      query: {
        lang: Locale.NI,
      },
      session: {
        locale: Locale.GB,
        target: Target.NI,
      },
    };

    await i18n.internationalisation(req as any, res, next);

    expect(changeLanguage).toHaveBeenCalledWith(req, res);
    expect(next).toHaveBeenCalled();
    expect(req.session.locale).toBe(Locale.NI);
  });

  test('Defaults to gb if locale is not set when target is gb', async () => {
    const req = {
      query: {
        lang: undefined,
      },
      session: {
        locale: undefined,
        target: Target.GB,
      },
    };

    await i18n.internationalisation(req as any, res, next);

    expect(changeLanguage).toHaveBeenCalledWith(req, res);
    expect(next).toHaveBeenCalled();
    expect(req.session.locale).toBe(Locale.GB);
  });

  test('Defaults to ni if locale is not set when target is ni', async () => {
    const req = {
      query: {
        lang: undefined,
      },
      session: {
        locale: undefined,
        target: Target.NI,
      },
    };

    await i18n.internationalisation(req as any, res, next);

    expect(changeLanguage).toHaveBeenCalledWith(req, res);
    expect(next).toHaveBeenCalled();
    expect(req.session.locale).toBe(Locale.NI);
  });

  test('Defaults to gb if locale is not', async () => {
    const req = {
      query: {
        lang: undefined,
      },
      session: {
        locale: undefined,
        target: undefined,
      },
    };

    await i18n.internationalisation(req as any, res, next);

    expect(changeLanguage).toHaveBeenCalledWith(req, res);
    expect(next).toHaveBeenCalled();
    expect(req.session.locale).toBe(Locale.GB);
  });
});
