import { CheckYourAnswers } from '../../../../src/pages/check-your-answers/check-your-answers';
import { mockCentres } from '../../../../src/repository/mock-data';
import { BookingHandler } from '../../../../src/pages/check-your-answers/booking-handler';
import { Candidate, Booking } from '../../../../src/services/session';
import { LANGUAGE, TestType, Voiceover } from '../../../../src/domain/enums';

const mockHandle = jest.fn();
jest.mock('../../../../src/pages/check-your-answers/booking-handler');
jest.mock('../../../../src/services/payments/payment-handler');
jest.mock('../../../../src/helpers/language', () => ({
  translate: (key: string): string | undefined => {
    if (key === 'generalContent.no') {
      return 'No';
    }
    if (key === 'generalContent.yes') {
      return 'Yes';
    }
    if (key === 'generalContent.language.english') {
      return 'English';
    }
    return undefined;
  },
}));
jest.mock('../../../../src/services/payments/payment-api-client');
jest.mock('../../../../src/services/payments/payment-helper', () => ({
  buildPaymentReference: () => 'mock-payment-ref',
  buildPersonReference: () => '999999999',
}));

describe('Check Your Answers controller', () => {
  let res: any;
  let req: any;
  const mockScheduling = jest.fn();
  const mockCrmGateway = jest.fn();
  const mockPaymentHandler = {
    handlePayment: jest.fn(),
  };
  let checkYourAnswers: CheckYourAnswers;

  beforeEach(() => {
    req = {
      session: {
        candidate: {
          firstnames: 'Test',
          surname: 'User',
          licenceNumber: 'JONES061102W97YT',
          dateOfBirth: '1990-01-01',
          email: 'test@test.com',
        } as Partial<Candidate>,
        currentBooking: {
          testType: TestType.Car,
          centre: mockCentres[0],
          language: LANGUAGE.ENGLISH,
          dateTime: '1997-07-16T19:20Z',
          support: false,
          bsl: false,
          voiceover: Voiceover.NONE,
        } as Partial<Booking>,
      },
    };

    res = {
      res_redirect: '',
      res_template: '',
      res_params: {},
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
      redirect: (url: string): void => {
        res.res_redirect = url;
      },
    };

    checkYourAnswers = new CheckYourAnswers(mockScheduling as any, mockCrmGateway as any, mockPaymentHandler as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders check-your-answers template', () => {
      checkYourAnswers.get(req, res);

      // Edit mode is turned on
      expect(req.session.journey.inEditMode).toBe(true);

      expect(res.res_template).toBe('check-your-answers');
      expect(res.res_params).toStrictEqual({
        firstNames: 'Test',
        surname: 'User',
        dateOfBirth: '1990-01-01',
        licenceNumber: 'JONES061102W97YT',
        emailAddress: 'test@test.com',
        testLanguage: 'English',
        dateTime: '1997-07-16T19:20Z',
        testCentre: mockCentres[0],
        testType: TestType.Car,
        additionalSupport: 'No',
        bsl: 'No',
        voiceover: 'No',
        errors: undefined,
      });
    });

    describe('updates the current booking with the changed location/date and time if those exist and resets the edited data given', () => {
      test('only the date and time have been changed', () => {
        req.session.editedLocationTime = {
          dateTime: 'some-date-here',
        };

        checkYourAnswers.get(req, res);

        expect(req.session.currentBooking.dateTime).toBe('some-date-here');
        expect(req.session.currentBooking.centre).toBe(mockCentres[0]);
        expect(req.session.editedLocationTime).toStrictEqual({});
      });

      test('both the date and time and the test centre have been changed', () => {
        req.session.editedLocationTime = {
          dateTime: 'some-date-here',
          centre: mockCentres[1],
        };

        checkYourAnswers.get(req, res);

        expect(req.session.currentBooking.dateTime).toBe('some-date-here');
        expect(req.session.currentBooking.centre).toBe(mockCentres[1]);
        expect(req.session.editedLocationTime).toStrictEqual({});
      });
    });
  });

  describe('POST request', () => {
    beforeEach(() => {
      BookingHandler.mockImplementation(() => ({ createBooking: mockHandle }));
    });

    test('redirects to booking confirmation after calling payment handler', async () => {
      mockPaymentHandler.handlePayment.mockImplementation(() => 'mockGatewayUrl');

      await checkYourAnswers.post(req, res);

      expect(mockPaymentHandler.handlePayment).toBeCalled();
      expect(res.res_redirect).toBe('mockGatewayUrl');
    });

    test('renders error page when reservation fails', async () => {
      mockHandle.mockImplementationOnce(() => Promise.reject(new Error('expected error')));
      await expect(checkYourAnswers.post(req, res)).rejects.toThrow('expected error');
    });

    test('renders check your answers page when payment fails ', async () => {
      res.render = jest.fn();
      mockPaymentHandler.handlePayment.mockImplementation(() => {
        throw Error('Payment error');
      });

      await checkYourAnswers.post(req, res);

      expect(mockPaymentHandler.handlePayment).toBeCalled();
      expect(res.render).toBeCalledWith('check-your-answers', expect.objectContaining({}));
    });
  });
});
