import { CRMBookingStatus } from '@dvsa/ftts-crm-test-client/dist/enums';
import { mocked } from 'ts-jest/utils';
import { InstructorCheckYourAnswersController } from '@pages/instructor-check-your-answers/instructor-check-your-answers';
import { PageNames } from '@constants';
import config from '../../../../src/config';
import {
  Language, Target, TestType, Voiceover,
} from '../../../../src/domain/enums';
import { CrmCreateBookingDataError } from '../../../../src/domain/errors/crm/CrmCreateBookingDataError';
import { logger } from '../../../../src/helpers/logger';
import { BookingHandler } from '../../../../src/helpers/booking-handler';
import { mockCentres } from '../../../mocks/data/mock-data';
import { CRMProductNumber } from '../../../../src/services/crm-gateway/enums';
import { SlotUnavailableError } from '../../../../src/services/scheduling/scheduling-gateway';
import { Booking, Candidate, Journey } from '../../../../src/services/session';

const mockHandle = jest.fn();
jest.mock('../../../../src/helpers/booking-handler');
jest.mock('../../../../src/helpers/language', () => ({
  ...jest.requireActual('../../../../src/helpers/language'),
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
jest.mock('../../../../src/config');
const mockedConfig = mocked(config, true);

describe('Instructor Check Your Answers controller', () => {
  let res: any;
  let req: any;
  const mockScheduling = jest.fn();
  const mockCrmGateway = {
    doesCandidateHaveExistingBookingsByTestType: jest.fn(),
    createBooking: jest.fn(),
  };
  const mockBookingHandler = {
    createBooking: jest.fn(),
  };
  let checkYourAnswers: InstructorCheckYourAnswersController;

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
          bookingProductId: 'mockBookingProductId',
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
          compensationBooking: {
            bookingProductId: 'mock-booking-id',
            bookingProductReference: 'mock-product-reference',
            bookingId: 'mock-booking-id',
            bookingStatus: CRMBookingStatus.Assigned,
            candidateId: 'mock-candidate-id',
            compensationAssigned: 'mock-assigned',
            compensationRecognised: 'mock-recognised',
            productNumber: CRMProductNumber.CAR,
            pricePaid: 30,
            price: 20,
            priceListId: 'mock-price-list-id',
          },
        } as Partial<Booking>,
        journey: {} as Partial<Journey>,
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };

    checkYourAnswers = new InstructorCheckYourAnswersController(mockScheduling as any, mockCrmGateway as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders check-your-answers template', () => {
      req.session.currentBooking.compensationBooking = undefined;
      checkYourAnswers.get(req, res);

      // Edit mode is turned on
      expect(req.session.journey.inEditMode).toBe(true);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, {
        firstNames: 'Test',
        surname: 'User',
        dateOfBirth: '1990-01-01',
        licenceNumber: 'JONES061102W97YT',
        emailAddress: 'test@test.com',
        testLanguage: 'English',
        canChangeTestLanguage: true,
        price: 11,
        isCompensationBooking: false,
        dateTime: '1997-07-16T19:20Z',
        testCentre: mockCentres[0],
        testType: TestType.CAR,
        supportRequested: 'No',
        bslAvailable: true,
        bsl: 'No',
        voiceover: 'No',
        bookingRequiresPayment: true,
        canChooseSupport: true,
        isZeroCostBooking: false,
        errors: undefined,
      });
    });

    test('renders check-your-answers template with compensation booking', () => {
      checkYourAnswers.get(req, res);

      // Edit mode is turned on
      expect(req.session.journey.inEditMode).toBe(true);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, expect.objectContaining({
        price: 20,
        isCompensationBooking: true,
      }));
    });

    test('support requested with always be No, even if select support answer was Yes', () => {
      req.session.journey.support = true;

      checkYourAnswers.get(req, res);

      expect(req.session.journey.support).toBe(true);
      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, expect.objectContaining({
        supportRequested: 'No',
      }));
    });

    describe('updates the current booking with the changed location/date and time if those exist and resets the edited data given', () => {
      test('only the date and time have been changed', () => {
        req.session.currentBooking.compensationBooking = undefined;
        req.session.editedLocationTime = {
          dateTime: 'some-date-here',
        };

        checkYourAnswers.get(req, res);

        expect(req.session.currentBooking.dateTime).toBe('some-date-here');
        expect(req.session.currentBooking.centre).toBe(mockCentres[0]);
        expect(req.session.editedLocationTime).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, {
          canChangeTestLanguage: true,
          firstNames: 'Test',
          surname: 'User',
          dateOfBirth: '1990-01-01',
          licenceNumber: 'JONES061102W97YT',
          emailAddress: 'test@test.com',
          testLanguage: 'English',
          price: 11,
          isCompensationBooking: false,
          dateTime: 'some-date-here',
          testCentre: mockCentres[0],
          testType: TestType.CAR,
          supportRequested: 'No',
          bslAvailable: true,
          bsl: 'No',
          voiceover: 'No',
          bookingRequiresPayment: true,
          canChooseSupport: true,
          isZeroCostBooking: false,
          errors: undefined,
        });
      });

      test('both the date and time and the test centre have been changed', () => {
        req.session.currentBooking.compensationBooking = undefined;
        req.session.editedLocationTime = {
          dateTime: 'some-date-here',
          centre: mockCentres[1],
        };

        checkYourAnswers.get(req, res);

        expect(req.session.currentBooking.dateTime).toBe('some-date-here');
        expect(req.session.currentBooking.centre).toBe(mockCentres[1]);
        expect(req.session.editedLocationTime).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, {
          firstNames: 'Test',
          surname: 'User',
          dateOfBirth: '1990-01-01',
          licenceNumber: 'JONES061102W97YT',
          emailAddress: 'test@test.com',
          testLanguage: 'English',
          canChangeTestLanguage: true,
          price: 11,
          isCompensationBooking: false,
          dateTime: 'some-date-here',
          testCentre: mockCentres[1],
          testType: TestType.CAR,
          supportRequested: 'No',
          bslAvailable: true,
          bsl: 'No',
          voiceover: 'No',
          bookingRequiresPayment: true,
          canChooseSupport: true,
          isZeroCostBooking: false,
          errors: undefined,
        });
      });

      test('sets bslAvailable false for non-car/motorcycle test type', () => {
        req.session.currentBooking.testType = TestType.LGVCPC;

        checkYourAnswers.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, expect.objectContaining({
          testType: TestType.LGVCPC,
          bslAvailable: false,
        }));
      });

      test('sets bookingRequiresPayment false for zero cost test types', () => {
        req.session.currentBooking.testType = TestType.ADIP1DVA;

        checkYourAnswers.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, expect.objectContaining({
          bookingRequiresPayment: false,
        }));
      });

      test('sets canChooseSupport false for DVA instructor service', () => {
        req.session.target = Target.NI;

        checkYourAnswers.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, expect.objectContaining({
          canChooseSupport: false,
        }));
      });
    });
  });

  describe('POST request', () => {
    beforeEach(() => {
      BookingHandler.mockImplementation(() => ({ createBooking: mockHandle }));
    });

    test('for not zero cost test type redirects to payment-initiation', async () => {
      req.session.currentBooking.compensationBooking = undefined;
      await checkYourAnswers.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('payment-initiation');
    });

    test('for compensation-booking redirects to payment-confirmation', async () => {
      await checkYourAnswers.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('payment-confirmation');
    });

    test('for zero cost test type redirects to payment-confirmation', async () => {
      req.session.currentBooking.testType = TestType.ADIP1DVA;

      await checkYourAnswers.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('payment-confirmation');
    });

    test('render slot unavailable error page if slot is unavailable', async () => {
      BookingHandler.mockImplementation(() => ({
        createBooking: () => {
          throw new SlotUnavailableError();
        },
      }));

      await checkYourAnswers.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ERROR_SLOT_UNAVAILABLE);
    });

    test('redirects to technical error page if createBooking throws CrmCreateBookingDataError', async () => {
      BookingHandler.mockImplementation(() => ({
        createBooking: () => {
          throw new CrmCreateBookingDataError();
        },
      }));

      await checkYourAnswers.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/error-technical?source=/&target=gb&lang=gb');
    });

    test('throws error when reserve/create booking call fails', async () => {
      mockHandle.mockRejectedValueOnce(new Error('expected error'));

      await expect(checkYourAnswers.post(req, res)).rejects.toThrow('expected error');
      expect(logger.error).toHaveBeenCalledWith(Error('expected error'), 'InstructorCheckYourAnswersController::post: Error creating booking entity in CRM');
    });

    test('if compensation booking, redirect to payment confirmation page', async () => {
      req.session.currentBooking.compensationBooking = {
        ftts_bookingstatus: 675030008,
        ftts_selected: true,
        bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
        bookingProductReference: 'B-000-193-849-01',
        bookingReference: 'B-000-193-849',
        productNumber: CRMProductNumber.ADIP1,
        compensationAssigned: '2021-08-13T15:00:02.000Z',
        candidateName: 'Wendy',
        bookingStatus: 675030008,
        candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
        bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
      };

      await checkYourAnswers.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('payment-confirmation');
    });

    test('if candidate has booking of same test type the redirected to booking exists page and blocked', async () => {
      req.session.currentBooking = {
        ftts_bookingstatus: CRMBookingStatus.Confirmed,
        ftts_selected: true,
        bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
        bookingProductReference: 'B-000-193-849-01',
        bookingReference: 'B-000-193-849',
        productNumber: CRMProductNumber.CAR,
        compensationAssigned: '2021-08-13T15:00:02.000Z',
        candidateName: 'Wendy',
        bookingStatus: CRMBookingStatus.Confirmed,
        candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
        bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
        testType: TestType.CAR,
      };

      mockCrmGateway.doesCandidateHaveExistingBookingsByTestType.mockResolvedValue([req.session.currentBooking]);

      await checkYourAnswers.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('booking-exists');
      expect(req.session.lastPage).toEqual('/instructor/check-your-answers');
      expect(mockBookingHandler.createBooking).toHaveBeenCalledTimes(0);
    });

    test('if existing booking feature toggle is disable - do not check for existing booking', async () => {
      mockedConfig.featureToggles.enableExistingBookingValidation = false;
      req.session.currentBooking = {
        ftts_bookingstatus: CRMBookingStatus.Confirmed,
        ftts_selected: true,
        bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
        bookingProductReference: 'B-000-193-849-01',
        bookingReference: 'B-000-193-849',
        productNumber: CRMProductNumber.CAR,
        compensationAssigned: '2021-08-13T15:00:02.000Z',
        candidateName: 'Wendy',
        bookingStatus: CRMBookingStatus.Confirmed,
        candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
        bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
        testType: TestType.CAR,
      };

      await checkYourAnswers.post(req, res);

      expect(mockCrmGateway.doesCandidateHaveExistingBookingsByTestType).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('payment-initiation');
    });
  });
});
