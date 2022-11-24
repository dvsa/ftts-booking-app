import { BritishSignLanagugeController } from '@pages/british-sign-language/british-sign-language';
import { PageNames } from '@constants';
import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { YesOrNo } from '../../../../src/value-objects/yes-or-no';
import { YesNo } from '../../../../src/domain/enums';

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
      redirect: jest.fn(),
      render: jest.fn(),
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

      expect(res.render).toHaveBeenCalledWith(PageNames.BRITISH_SIGN_LANGUAGE, {
        chosenBSL: undefined,
        bookingRef: mockBookingRef,
        errors: [],
      });
      expect(req.session.manageBookingEdits).toBeUndefined();
    });

    test('correctly renders page in edit mode and bsl is set to true', () => {
      req.session.journey.inEditMode = true;
      req.session.currentBooking.bsl = true;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BRITISH_SIGN_LANGUAGE, {
        chosenBSL: YesNo.YES,
        bookingRef: mockBookingRef,
        errors: [],
      });
    });

    test('correctly renders page in edit mode and bsl is set to false', () => {
      req.session.journey.inEditMode = true;
      req.session.currentBooking.bsl = false;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BRITISH_SIGN_LANGUAGE, {
        chosenBSL: YesNo.NO,
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

      expect(res.render).toHaveBeenCalledWith(PageNames.BRITISH_SIGN_LANGUAGE, {
        chosenBSL: undefined,
        bookingRef: mockBookingRef,
        errors: [{ param: 'bsl', msg: 'translated' }],
      });
    });

    test('correctly updates session and redirects if post is successful', () => {
      req.body.bsl = YesNo.YES;

      controller.post(req, res);

      expect(req.session.manageBookingEdits.bsl).toEqual(true);
      expect(res.redirect).toHaveBeenCalledWith('check-change');
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
