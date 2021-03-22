import { internalServerError, pageNotFound } from '../../../src/middleware/error-handler';

describe('error handler', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {};
    res = {
      res_status: 200,
      res_template: '',
      res_params: [],
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
      status: jest.fn().mockImplementationOnce((status) => {
        res.res_status = status;
      }),
    };
  });

  test('error 500 page renders when an internal server error occurs', () => {
    const error = new Error('error');
    internalServerError(error, req, res);

    expect(res.res_status).toBe(500);
    expect(res.res_template).toBe('error500');
    expect(res.res_params).toMatchObject({
      errors: true,
    });
  });

  test('error 404 page renders when a page not found error occurs', () => {
    pageNotFound(req, res);

    expect(res.res_status).toBe(404);
    expect(res.res_template).toBe('error404');
    expect(res.res_params).toMatchObject({
      errors: true,
    });
  });
});
