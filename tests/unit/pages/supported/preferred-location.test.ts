import { PreferredLocation } from '../../../../src/domain/enums';
import { PreferredLocationController } from '../../../../src/pages/supported/preferred-location';

describe('Preferred Location controller', () => {
  let preferredLocationController: PreferredLocationController;
  let res;
  let req;

  beforeEach(() => {
    preferredLocationController = new PreferredLocationController();

    req = {
      session: {
        currentBooking: {
          preferredLocation: 'mockSavedPreferredLocation',
          preferredLocationOption: PreferredLocation.ParticularLocation,
        },
      },
      hasErrors: false,
      errors: [],
      body: {
        locationInput: 'mockPreferredLocation',
        preferredLocationOption: PreferredLocation.ParticularLocation,
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
    test('renders the preferred location page with saved text & options', () => {
      req.body.locationInput = undefined;
      req.body.preferredLocationOption = undefined;

      preferredLocationController.get(req, res);

      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-location');
      expect(res.render).toHaveBeenCalledWith('supported/preferred-location', {
        errors: [],
        savedPreferredLocation: 'mockSavedPreferredLocation',
        preferredLocationOption: PreferredLocation.ParticularLocation,
      });
    });
  });

  describe('POST request', () => {
    test('post validation schema - setting particular location', () => {
      req.body.preferredLocationOption = PreferredLocation.ParticularLocation;

      const schema = preferredLocationController.postSchemaValidation(req);

      expect(schema).toStrictEqual(expect.objectContaining({
        locationInput: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: expect.anything(),
          },
        },
      }));
    });

    test('post validation schema - particular location not set', () => {
      req.body.preferredLocationOption = PreferredLocation.DecideLater;

      const schema = preferredLocationController.postSchemaValidation(req);

      expect(schema).toStrictEqual(expect.objectContaining({
        preferredLocationOption: {
          in: ['body'],
          errorMessage: expect.anything(),
          custom: {
            options: expect.anything(),
          },
        },
      }));

      expect(schema).toStrictEqual(expect.objectContaining({

      }));
    });

    test('renders the preferred day page if there are errors - but still saves the data', () => {
      const longString = new Array(4001 + 1).join('a');
      req.body.locationInput = longString;

      preferredLocationController.post(req, res);

      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-location');
      expect(req.session.currentBooking.preferredLocation).toStrictEqual(longString);
      expect(res.render).toHaveBeenCalledWith('supported/preferred-location', {
        errors: [],
        savedPreferredLocation: longString,
        preferredLocationOption: PreferredLocation.ParticularLocation,
      });
    });

    test('selecting decide later will still save the users text', () => {
      req.body.locationInput = 'new text';
      req.body.preferredLocationOption = PreferredLocation.DecideLater;

      preferredLocationController.post(req, res);

      expect(req.session.currentBooking.preferredLocation).toStrictEqual('new text');
      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-location');
    });

    test('navigate to next page', () => {
      req.body.locationInput = 'changed location preference';

      preferredLocationController.post(req, res);

      expect(req.session.currentBooking.preferredLocation).toStrictEqual('changed location preference');
      expect(res.res_status).toStrictEqual(200);
      expect(res.res_template).toStrictEqual('supported/preferred-location');
    });
  });
});
