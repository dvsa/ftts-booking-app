import { NextFunction, Request, Response } from 'express';
import { setCookieHeader } from '../../../src/helpers/cookie-helper';
import { setAnalyticsCookie } from '../../../src/middleware/set-analytics-cookie';
import { store } from '../../../src/services/session';

jest.mock('../../../src/helpers/cookie-helper');

describe('setAnalyticsCookie', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      query: {},
      session: {},
      cookies: {},
    } as unknown as Request;
    res = {
      locals: {},
      redirect: jest.fn(),
      cookie: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
    store.reset = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('query string tests', () => {
    test('WHEN cookie query string is accept THEN a new cookie should be created with the value accept', () => {
      req.query = {
        cookies: 'accept',
      };

      setAnalyticsCookie(req, res, next);

      expect(setCookieHeader).toHaveBeenCalledWith(
        res,
        'cm-user-preferences',
        'accept',
        {
          httpOnly: true,
          maxAge: 31536000,
          secure: true,
        },
      );
      expect(res.locals).toStrictEqual({
        cookiesEnabled: true,
        cookiePreferenceSet: true,
      });
      expect(next).toHaveBeenCalled();
    });

    test('WHEN cookie query string is reject THEN a new cookie should be created with the value reject', () => {
      req.query = {
        cookies: 'reject',
      };
      res.locals.cookiesEnabled = true;

      setAnalyticsCookie(req, res, next);

      expect(setCookieHeader).toHaveBeenCalledWith(
        res,
        'cm-user-preferences',
        'reject',
        {
          httpOnly: true,
          maxAge: 0,
          secure: true,
        },
      );
      expect(res.locals).toStrictEqual({
        cookiesEnabled: false,
        cookiePreferenceSet: true,
      });
      expect(next).toHaveBeenCalled();
    });

    test('WHEN cookie query string is invalid THEN we should set cookiesEnabled to false', () => {
      req.query = {
        cookies: 'invalid',
      };

      setAnalyticsCookie(req, res, next);

      expect(res.locals).toStrictEqual({
        cookiesEnabled: false,
        cookiePreferenceSet: false,
      });
      expect(next).toHaveBeenCalled();
    });

    test('WHEN cookie query string is redirect THEN we redirect the user to the view cookies page', () => {
      req.query = {
        viewCookies: 'redirect',
      };

      setAnalyticsCookie(req, res, next);

      expect(res.locals).toStrictEqual({
        cookiesEnabled: false,
        cookiePreferenceSet: false,
      });
      expect(res.redirect).toHaveBeenCalledWith('/view-cookies');
    });
  });

  describe('cookie tests', () => {
    test('WHEN accepted cookie is present THEN we should set cookiesEnabled to true', () => {
      req.query = {};
      req.cookies['cm-user-preferences'] = 'accept';

      setAnalyticsCookie(req, res, next);

      expect(res.locals).toStrictEqual({
        cookiesEnabled: true,
        cookiePreferenceSet: false,
      });
      expect(next).toHaveBeenCalled();
    });

    test('WHEN rejected cookie is present THEN we should set cookiesEnabled to false', () => {
      req.query = {};
      req.cookies['cm-user-preferences'] = 'reject';

      setAnalyticsCookie(req, res, next);

      expect(res.locals).toStrictEqual({
        cookiesEnabled: false,
        cookiePreferenceSet: false,
      });
      expect(next).toHaveBeenCalled();
    });

    test('WHEN no cookie is present THEN we should set cookiesEnabled to false', () => {
      setAnalyticsCookie(req, res, next);

      expect(res.locals).toStrictEqual({
        cookiesEnabled: false,
        cookiePreferenceSet: false,
      });
      expect(next).toHaveBeenCalled();
    });
  });
});
