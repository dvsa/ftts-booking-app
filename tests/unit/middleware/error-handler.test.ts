import { InternalAccessDeniedError } from '@dvsa/egress-filtering';
import { PageNames } from '@constants';
import { internalServerError, pageNotFound } from '../../../src/middleware/error-handler';
import { logger } from '../../../src/helpers/logger';

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
    internalServerError(error, req, res, () => {});

    expect(res.res_status).toBe(500);
    expect(res.res_template).toBe(PageNames.INTERNAL_SERVER_ERROR);
    expect(res.res_params).toMatchObject({
      errors: true,
    });
  });

  test('if we catch an egress error then error is logged and error 500 is rendered', () => {
    const error = new InternalAccessDeniedError('https://evil-corp.com', '80', 'not accessible');

    internalServerError(error, req, res, () => {});

    expect(res.res_status).toBe(500);
    expect(res.res_template).toBe(PageNames.INTERNAL_SERVER_ERROR);
    expect(res.res_params).toMatchObject({
      errors: true,
    });
    expect(logger.security).toHaveBeenCalledWith('errorHandler::internalServerError: url is not whitelisted so it cannot be called', {
      host: error.host,
      port: error.port,
      reason: JSON.stringify(error),
    });
    expect(logger.event).toHaveBeenCalledWith('NOT_WHITELISTED_URL_CALL', error.message,
      {
        host: error.host,
        port: error.port,
      });
  });

  test('error 404 page renders when a page not found error occurs', () => {
    pageNotFound(req, res);

    expect(res.res_status).toBe(404);
    expect(res.res_template).toBe(PageNames.NOT_FOUND);
    expect(res.res_params).toMatchObject({
      errors: true,
    });
  });
});
