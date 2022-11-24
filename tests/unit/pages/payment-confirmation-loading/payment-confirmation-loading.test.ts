import { PageNames } from '@constants';
import { Booking } from '@dvsa/ftts-crm-test-client/dist/types';
import paymentConfirmationLoading from '@pages/payment-confirmation-loading/payment-confirmation-loading';
import {
  TestType, Language, Voiceover, Target,
} from '../../../../src/domain/enums';
import { logger } from '../../../../src/helpers/logger';
import { mockCentres } from '../../../mocks/data/mock-data';
import { Journey } from '../../../../src/services/session';

describe('paymentConfirmationLoading', () => {
  let res: any;
  let req: any;

  beforeEach(() => {
    req = {
      session: {
        currentBooking: {
          bookingProductId: 'mockBookingProductId',
          bookingRef: 'test123',
          testType: TestType.CAR,
          centre: mockCentres[0],
          language: Language.ENGLISH,
          dateTime: '1997-07-16T19:20Z',
          support: false,
          bsl: false,
          voiceover: Voiceover.NONE,
          priceList: {
            testType: TestType.CAR,
            price: 11,
            product: {
              productId: '123',
              parentId: '321',
            },
          },
        } as Partial<Booking>,
        journey: {
          isInstructor: false,
        } as Partial<Journey>,
        target: Target.GB,
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
    test('if current booking exists for a candidate', () => {
      paymentConfirmationLoading.get(req, res);
      expect(res.render).toHaveBeenCalledWith(PageNames.PAYMENT_CONFIRMATION_LOADING, {
        redirectUrl: '/payment-confirmation/test123',
        refreshTime: 3,
      });
    });

    test('if current booking exists for an instructor', () => {
      req.session.journey.isInstructor = true;
      paymentConfirmationLoading.get(req, res);
      expect(res.render).toHaveBeenCalledWith(PageNames.PAYMENT_CONFIRMATION_LOADING, {
        redirectUrl: '/instructor/payment-confirmation/test123',
        refreshTime: 3,
      });
    });

    test('if current booking does not exist', () => {
      req.session.currentBooking.bookingRef = '';
      expect(() => paymentConfirmationLoading.get(req, res)).toThrow('PaymentConfirmationLoading:: get : Missing required booking reference number');
      expect(logger.critical).toHaveBeenCalledWith('PaymentConfirmationLoading:: get : Missing required booking reference number');
    });
  });
});
