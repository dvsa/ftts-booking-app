import { InstructorBritishSignLanagugeController } from '@pages/instructor-british-sign-language/instructor-british-sign-language';
import { PageNames } from '@constants';
import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { YesOrNo } from '../../../../src/value-objects/yes-or-no';
import { YesNo } from '../../../../src/domain/enums';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('InstructorBritishSignLanagugeController', () => {
  let req: any;
  let res: any;
  let controller: InstructorBritishSignLanagugeController;

  const mockBookingRef = 'mock-booking-ref';

  beforeEach(() => {
    controller = new InstructorBritishSignLanagugeController();
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
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    test('correctly renders page in edit mode and bsl is set to true', () => {
      req.session.journey.inEditMode = true;
      req.session.currentBooking.bsl = true;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_BRITISH_SIGN_LANGUAGE, {
        chosenBSL: YesNo.YES,
        bookingRef: mockBookingRef,
        errors: [],
      });
    });

    test('correctly renders page in edit mode and bsl is set to false', () => {
      req.session.journey.inEditMode = true;
      req.session.currentBooking.bsl = false;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_BRITISH_SIGN_LANGUAGE, {
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

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_BRITISH_SIGN_LANGUAGE, {
        chosenBSL: undefined,
        bookingRef: mockBookingRef,
        errors: [{ param: 'bsl', msg: 'translated' }],
      });
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
