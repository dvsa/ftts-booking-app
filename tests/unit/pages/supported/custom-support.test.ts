import { CustomSupportController } from '../../../../src/pages/supported/custom-support';

describe('Custom support controller', () => {
  let customSupportController: CustomSupportController;
  let res;
  let req;

  beforeEach(() => {
    customSupportController = new CustomSupportController();

    req = {
      session: {
        currentBooking: {
          customSupport: 'mockSavedSupport',
        },
      },
      hasErrors: false,
      errors: [],
      body: {
        support: 'mockSupportData',
      },
    };

    res = {
      res_params: {},
      res_status: 200,
      res_template: '',
      status: (status: number): object => {
        res.res_status = status;
        return res;
      },
      render: jest.fn().mockImplementation((template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      }),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders the custom support page with saved text', () => {
      customSupportController.get(req, res);

      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/custom-support');
      expect(res.render).toHaveBeenCalledWith('supported/custom-support', {
        errors: [],
        savedCustomSupport: 'mockSavedSupport',
      });
    });
  });

  describe('POST request', () => {
    test('post validation schema', () => {
      expect(customSupportController.postSchemaValidation()).toStrictEqual(expect.objectContaining({
        support: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: expect.anything(),
          },
        },
      }));
    });

    test('renders the custom support page if there are errors - but still saves the data', () => {
      const longString = new Array(4001 + 1).join('a');
      req.body.support = longString;

      customSupportController.post(req, res);

      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/custom-support');
      expect(req.session.currentBooking.customSupport).toStrictEqual(longString);
      expect(res.render).toHaveBeenCalledWith('supported/custom-support', {
        errors: [],
        savedCustomSupport: longString,
      });
    });

    test('navigate to we will contact you page', () => {
      req.body.support = 'changed support';

      customSupportController.post(req, res);

      expect(req.session.currentBooking.customSupport).toStrictEqual('changed support');
      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/custom-support');
    });
  });
});
