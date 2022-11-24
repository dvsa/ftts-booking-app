import { instructorStandardAuth } from '../../../../src/middleware/auth/instructor-standard-auth';

describe('Auth middleware - Instructor standard main booking journey', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      session: {
        candidate: {
          firstnames: 'First Names',
        },
        journey: undefined,
      },
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  test('redirects to session timeout if standard accommodation is set to false', () => {
    req.session.journey = {
      standardAccommodation: false,
    };

    instructorStandardAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/timeout'));
  });
});
