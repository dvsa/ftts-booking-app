import { setEditMode } from '../../../src/middleware/set-edit-mode';

describe('set edit mode', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      session: {
        journey: {
          inEditMode: true,
        },
      },
    };
    res = {
      locals: {},
    };
    next = jest.fn();
  });

  test('support mode is set in locals', () => {
    setEditMode(req, res, next);

    expect(res.locals.inEditMode).toBe(req.session.journey.inEditMode);
    expect(next).toHaveBeenCalled();
  });
});
