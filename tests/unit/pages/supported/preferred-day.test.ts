import { PreferredDay } from '../../../../src/domain/enums';
import { PreferredDayController } from '../../../../src/pages/supported/preferred-day';

describe('Preferred Day controller', () => {
  let preferredDayController: PreferredDayController;
  let res;
  let req;

  beforeEach(() => {
    preferredDayController = new PreferredDayController();

    req = {
      session: {
        currentBooking: {
          preferredDay: 'mockSavedPreferredDay',
          preferredDayOption: PreferredDay.ParticularDay,
        },
      },
      hasErrors: false,
      errors: [],
      body: {
        dayInput: 'mockPreferredDay',
        preferredDayOption: PreferredDay.ParticularDay,
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
    test('renders the preferred day page with saved text & options', () => {
      req.body.dayInput = undefined;
      req.body.preferredDayOption = undefined;

      preferredDayController.get(req, res);

      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-day');
      expect(res.render).toHaveBeenCalledWith('supported/preferred-day', {
        errors: [],
        savedPreferredDay: 'mockSavedPreferredDay',
        preferredDayOption: PreferredDay.ParticularDay,
      });
    });
  });

  describe('POST request', () => {
    test('post validation schema - setting particular day', () => {
      req.body.preferredDayOption = PreferredDay.ParticularDay;

      const schema = preferredDayController.postSchemaValidation(req);

      expect(schema).toStrictEqual({
        dayInput: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: expect.anything(),
          },
        },
      });
    });

    test('post validation schema - particular option not set', () => {
      req.body.preferredDayOption = PreferredDay.DecideLater;

      const schema = preferredDayController.postSchemaValidation(req);

      expect(schema).toStrictEqual({
        preferredDayOption: {
          in: ['body'],
          errorMessage: expect.anything(),
          custom: {
            options: expect.anything(),
          },
        },
      });
    });

    test('renders the preferred day page if there are errors - but still saves the data', () => {
      const longString = new Array(4001 + 1).join('a');
      req.body.dayInput = longString;

      preferredDayController.post(req, res);

      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-day');
      expect(req.session.currentBooking.preferredDay).toStrictEqual(longString);
      expect(res.render).toHaveBeenCalledWith('supported/preferred-day', {
        errors: [],
        savedPreferredDay: longString,
        preferredDayOption: PreferredDay.ParticularDay,
      });
    });

    test('selecting decide later will still save the users text', () => {
      req.body.dayInput = 'new text';
      req.body.preferredDayOption = PreferredDay.DecideLater;

      preferredDayController.post(req, res);

      expect(req.session.currentBooking.preferredDay).toStrictEqual('new text');
      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-day');
    });

    test('navigate to next page', () => {
      req.body.dayInput = 'changed day preference';

      preferredDayController.post(req, res);

      expect(req.session.currentBooking.preferredDay).toStrictEqual('changed day preference');
      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-day');
    });
  });
});
