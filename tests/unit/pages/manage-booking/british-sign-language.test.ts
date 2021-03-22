import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { BritishSignLanagugeController } from '../../../../src/pages/manage-booking/british-sign-language';
import { YesOrNo } from '../../../../src/value-objects/yes-or-no';
import { YES_NO } from '../../../../src/domain/enums';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('BritishSignLanagugeController', () => {
  let req: any;
  let res: any;
  let controller: BritishSignLanagugeController;

  const mockBookingRef = 'mock-booking-ref';

  beforeEach(() => {
    controller = new BritishSignLanagugeController();
    req = {
      body: {
        bsl: 'No',
      },
      hasErrors: false,
      errors: [],
      session: {
        currentBooking: {
          bookingRef: mockBookingRef,
        },
        journey: {
          inEditMode: false,
        },
        manageBookingEdits: {},
      },
    };

    res = {
      res_status: 200,
      res_template: '',
      status: (status: number): object => {
        res.res_status = status;
        return res;
      },
      redirect: (url: string): void => {
        res.res_url = url;
        res.res_status = 301;
      },
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    test('correctly renders page from manage booking flow', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.manageBookingEdits = {
        bsl: false,
      };

      controller.get(req, res);

      expect(res.res_template).toBe('manage-booking/british-sign-language');
      expect(res.res_status).toBe(200);
      expect(res.res_params).toStrictEqual({
        chosenBSL: undefined,
        bookingRef: mockBookingRef,
        errors: [],
      });
      expect(req.session.manageBookingEdits).toStrictEqual({});
    });

    test('correctly renders page in edit mode and bsl is set to true', () => {
      req.session.journey.inEditMode = true;
      req.session.currentBooking.bsl = true;

      controller.get(req, res);

      expect(res.res_template).toBe('manage-booking/british-sign-language');
      expect(res.res_status).toBe(200);
      expect(res.res_params).toStrictEqual({
        chosenBSL: YES_NO.YES,
        bookingRef: mockBookingRef,
        errors: [],
      });
    });

    test('correctly renders page in edit mode and bsl is set to false', () => {
      req.session.journey.inEditMode = true;
      req.session.currentBooking.bsl = false;

      controller.get(req, res);

      expect(res.res_template).toBe('manage-booking/british-sign-language');
      expect(res.res_status).toBe(200);
      expect(res.res_params).toStrictEqual({
        chosenBSL: YES_NO.NO,
        bookingRef: mockBookingRef,
        errors: [],
      });
    });
  });

  describe('post', () => {
    test('renders british sign lanaguge page with errors on validation error', () => {
      req.hasErrors = true;
      req.errors = [{ param: 'bsl', msg: '12345' }];

      controller.post(req, res);

      expect(res.res_template).toBe('manage-booking/british-sign-language');
      expect(res.res_params.errors).toStrictEqual(req.errors);
      expect(res.res_params).toStrictEqual({
        chosenBSL: undefined,
        bookingRef: mockBookingRef,
        errors: [{ param: 'bsl', msg: 'translated' }],
      });
    });

    test('correctly updates session and redirects if post is successful', () => {
      req.body.bsl = YES_NO.YES;

      controller.post(req, res);

      expect(req.session.manageBookingEdits.bsl).toEqual(true);
      expect(res.res_status).toBe(301);
      expect(res.res_url).toBe('check-change');
    });
  });

  describe('postSchemaValidation', () => {
    test('schema validation matches', () => {
      const expectedValidationSchema: ValidatorSchema = {
        bsl: {
          in: ['body'],
          custom: {
            options: YesOrNo.isValid,
          },
        },
      };
      expect(controller.postSchemaValidation).toStrictEqual(expectedValidationSchema);
    });
  });
});
