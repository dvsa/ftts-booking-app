import { Locale, Target } from '../../../src/domain/enums';
import { isLocaleAvailableForTarget, resetLocale } from '../../../src/helpers/language';
import { setTarget } from '../../../src/middleware/set-target';
import { store } from '../../../src/services/session';

jest.mock('../../../src/helpers/language');

describe('setTarget', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    const UnMockedisLocaleAvailableForTarget = jest.requireActual('../../../src/helpers/language').isLocaleAvailableForTarget;
    const UnMockedResetLocale = jest.requireActual('../../../src/helpers/language').resetLocale;
    isLocaleAvailableForTarget.mockImplementation(UnMockedisLocaleAvailableForTarget);
    resetLocale.mockImplementation(UnMockedResetLocale);

    req = {
      query: {},
      session: {},
    };
    res = {
      locals: {},
    };
    next = jest.fn();
    store.reset = jest.fn();
  });

  test('can change the target to GB', async () => {
    req.query = {
      target: 'gb',
    };

    await setTarget(req, res, next);

    expect(store.reset).toHaveBeenCalled();
    expect(req.session.target).toEqual(Target.GB);
    expect(res.locals).toStrictEqual({
      target: Target.GB,
    });
    expect(next).toHaveBeenCalled();
  });

  test('can change the target to NI', async () => {
    req.query = {
      target: 'ni',
    };

    await setTarget(req, res, next);

    expect(store.reset).toHaveBeenCalled();
    expect(req.session.target).toEqual(Target.NI);
    expect(res.locals).toStrictEqual({
      target: Target.NI,
    });
    expect(next).toHaveBeenCalled();
  });

  test('does not do anything if the query value is missing', async () => {
    await setTarget(req, res, next);

    expect(store.reset).not.toHaveBeenCalled();
    expect(req.session.target).toBeUndefined();
    expect(res.locals).toStrictEqual({});
    expect(next).toHaveBeenCalled();
  });

  test('does not do anything if the query value is invalid', async () => {
    req.query = {
      target: 'invalid',
    };

    await setTarget(req, res, next);

    expect(store.reset).not.toHaveBeenCalled();
    expect(req.session.target).toBeUndefined();
    expect(res.locals).toStrictEqual({});
    expect(next).toHaveBeenCalled();
  });

  test('does not do anything if app is in editMode', async () => {
    req.query = {
      target: 'gb',
    };
    req.session = {
      journey: {
        inEditMode: true,
      },
    };

    await setTarget(req, res, next);

    expect(store.reset).not.toHaveBeenCalled();
    expect(req.session.target).toBeUndefined();
    expect(res.locals).toStrictEqual({});
    expect(next).toHaveBeenCalled();
  });

  test('changing target to gb resets the locale if locale is ni', async () => {
    req.query = {
      lang: 'ni',
      target: 'gb',
    };
    req.session = {
      locale: 'ni',
      target: 'ni',
    };

    await setTarget(req, res, next);

    expect(store.reset).toHaveBeenCalled();
    expect(req.session.target).toEqual(Target.GB);
    expect(req.session.locale).toEqual(Locale.GB);
    expect(res.locals).toStrictEqual({
      target: Target.GB,
    });
    expect(next).toHaveBeenCalled();
  });

  test('changing target to ni resets the locale if locale is gb', async () => {
    req.query = {
      lang: 'cy',
      target: 'ni',
    };
    req.session = {
      locale: 'gb',
      target: 'gb',
    };

    await setTarget(req, res, next);

    expect(store.reset).toHaveBeenCalled();
    expect(req.session.target).toEqual(Target.NI);
    expect(req.session.locale).toEqual(Locale.NI);
    expect(res.locals).toStrictEqual({
      target: Target.NI,
    });
    expect(next).toHaveBeenCalled();
  });
});
