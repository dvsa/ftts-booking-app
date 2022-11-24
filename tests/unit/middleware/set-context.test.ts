import { Context } from '../../../src/domain/enums';
import { setContext } from '../../../src/middleware/set-context';

describe('setContext', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: {},
      session: {},
    };
    res = {
    };
    next = jest.fn();
  });

  test('can change the application context to Candidate', () => {
    req.query = {
      context: Context.CITIZEN,
    };

    setContext(req, res, next);

    expect(req.session.context).toEqual(Context.CITIZEN);
    expect(next).toHaveBeenCalled();
  });

  test('can change the application context to Instructor', () => {
    req.query = {
      context: Context.INSTRUCTOR,
    };

    setContext(req, res, next);

    expect(req.session.context).toEqual(Context.INSTRUCTOR);
    expect(next).toHaveBeenCalled();
  });

  test('handle missing context parameter', () => {
    req.query = {
      lang: 'cy',
      target: 'ni',
    };

    setContext(req, res, next);

    expect(req.session.context).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
