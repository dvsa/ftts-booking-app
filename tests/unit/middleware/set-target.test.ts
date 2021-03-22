import { setTarget } from '../../../src/middleware/set-target';

describe('Set Target', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: {
        target: 'test',
      },
      session: {},
    };
    res = {
      locals: {},
    };
    next = jest.fn();
  });

  test('empty query is handled', () => {
    setTarget(req, res, next);

    expect(res.locals.target).toEqual('gb');
    expect(next).toHaveBeenCalled();
  });

  test('invalid target is handled', () => {
    req.query.target = 'invalid';

    setTarget(req, res, next);

    expect(res.locals.target).toEqual('gb');
    expect(next).toHaveBeenCalled();
  });

  test('target is set to NI', () => {
    req.query.target = 'ni';

    setTarget(req, res, next);

    expect(req.session.target).toEqual('ni');
    expect(res.locals.target).toEqual('ni');
    expect(next).toHaveBeenCalled();
  });
});
