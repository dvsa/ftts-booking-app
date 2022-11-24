import { startAuth } from '../../../../src/middleware/auth/start-auth';

describe('Auth middleware - start of journey', () => {
  let req: any;
  let res: any;
  let next: any;
  const timeoutErrorPath = '/timeout';

  beforeEach(() => {
    req = {
      session: {
        candidate: undefined,
        journey: undefined,
        testCentreSearch: undefined,
      },
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  test('redirects to session timeout error if session journey is not set', () => {
    req.session.journey = undefined;

    startAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(timeoutErrorPath));
  });

  test('redirects to session timeout error if candidate is set', () => {
    req.session.candidate = {
      firstnames: 'First Names',
    };

    startAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(timeoutErrorPath));
  });

  test('redirects to session timeout error if journey is set, candidate is set and we\'re not in edit mode', () => {
    req.session.journey = {
      support: true,
      standardAccommodation: false,
      inEditMode: false,
    };
    req.session.candidate = {
      firstnames: 'First Names',
    };

    startAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(timeoutErrorPath));
  });
});
