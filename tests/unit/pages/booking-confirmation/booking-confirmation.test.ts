import { BookingConfirmation } from '@pages/booking-confirmation/booking-confirmation';
import { PageNames } from '@constants';
import { mockCentres } from '../../../mocks/data/mock-data';
import {
  EvidencePath, Language, PreferredDay, PreferredLocation, SupportType, Target, TestType,
} from '../../../../src/domain/enums';
import { determineEvidenceRoute } from '../../../../src/helpers/evidence-helper';
import config from '../../../../src/config';

jest.mock('../../../../src/helpers/language', () => ({
  translate: (key: string): string | undefined => {
    if (key === 'generalContent.language.english') {
      return 'English';
    }
    if (key === 'bookingConfirmation.nonStandardAccommodation.iWillDecideThisLater') {
      return 'To be decided later';
    }
    if (key === 'generalContent.testTypes.car') {
      return 'Car';
    }
    return undefined;
  },
}));
jest.mock('../../../../src/helpers/evidence-helper', () => ({
  isDeafCandidate: jest.fn(),
  determineEvidenceRoute: jest.fn(),
}));

const mockCrmGateway = {
  hasCRMSupportNeeds: jest.fn(),
};

describe('Booking confirmation controller', () => {
  let bookingConfirmation: BookingConfirmation;
  let res;
  let req;

  const mockTestType = TestType.CAR;
  const mockBookingRef = '123456-123';
  const mockTestDateTime = '2020-08-13T10:00:00.000Z';
  const testDateMinus3ClearWorkingDays = '2020-08-07';
  const mockCentre = mockCentres[0];
  const mockEmail = 'anyone@test.com';
  const mockReservationId = 'res001';
  const mockBookingId = 'book123';
  const mockTarget = Target.GB;

  beforeEach(() => {
    bookingConfirmation = new BookingConfirmation(mockCrmGateway as any);

    req = {
      session: {
        candidate: {
          email: mockEmail,
          candidateId: 'DummyId',
        },
        currentBooking: {
          testType: mockTestType,
          centre: mockCentre,
          reservationId: mockReservationId,
          bookingRef: mockBookingRef,
          bookingId: mockBookingId,
          dateTime: mockTestDateTime,
          lastRefundDate: testDateMinus3ClearWorkingDays,
          language: Language.ENGLISH,
          preferredDay: 'DummyDay',
          preferredDayOption: PreferredDay.DecideLater,
          preferredLocation: 'DummyLocation',
          preferredLocationOption: PreferredLocation.DecideLater,
          selectSupportType: [SupportType.EXTRA_TIME],
        },
        journey: {
          support: false,
          standardAccommodation: true,
          evidencePath: EvidencePath.EVIDENCE_REQUIRED,
        },
        target: mockTarget,
      },
    };

    res = {
      status: jest.fn(),
      render: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders the booking confirmation page with correct template params', () => {
      config.featureToggles.digitalResultsEmailInfo = true;
      bookingConfirmation.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_CONFIRMATION, {
        centre: mockCentre,
        bookingRef: mockBookingRef,
        dateTime: mockTestDateTime,
        testType: mockTestType,
        latestRefundDate: testDateMinus3ClearWorkingDays,
        bslAvailable: true,
        language: 'English',
        inSupportMode: false,
        digitalResultsEmailInfo: true,
      });
    });

    test('sets bslAvailable false for non-car/motorcycle test type', () => {
      req.session.currentBooking.testType = TestType.LGVCPC;

      bookingConfirmation.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_CONFIRMATION, expect.objectContaining({
        bslAvailable: false,
      }));
    });

    test('renders the booking confirmation page when in supported standard journey', () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = true;
      config.featureToggles.digitalResultsEmailInfo = false;

      bookingConfirmation.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_CONFIRMATION, {
        centre: mockCentre,
        bookingRef: mockBookingRef,
        dateTime: mockTestDateTime,
        testType: mockTestType,
        latestRefundDate: testDateMinus3ClearWorkingDays,
        bslAvailable: true,
        language: 'English',
        inSupportMode: false,
        digitalResultsEmailInfo: false,
      });
    });

    test('renders the NSA booking confirmation page when in support mode and with preferDay and PreferLocation with different Values', () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      req.session.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
      req.session.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
      mockCrmGateway.hasCRMSupportNeeds.mockReturnValue(false);
      determineEvidenceRoute.mockReturnValue(EvidencePath.EVIDENCE_REQUIRED);

      bookingConfirmation.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_CONFIRMATION_EVIDENCE_REQUIRED, {
        bookingRef: mockBookingRef,
        deafCandidate: undefined,
        inSupportMode: true,
        language: 'English',
        preferDay: 'DummyDay',
        preferLocation: 'DummyLocation',
        supportTypes: [SupportType.EXTRA_TIME],
        testType: 'Car',
      });
    });
    test('renders the NSA booking confirmation page when in support mode with no evidence required', () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      mockCrmGateway.hasCRMSupportNeeds.mockReturnValue(false);
      determineEvidenceRoute.mockReturnValue(EvidencePath.EVIDENCE_NOT_REQUIRED);

      bookingConfirmation.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_CONFIRMATION_EVIDENCE_NOT_REQUIRED, {
        bookingRef: mockBookingRef,
        deafCandidate: undefined,
        inSupportMode: true,
        language: 'English',
        preferDay: 'To be decided later',
        preferLocation: 'To be decided later',
        supportTypes: [SupportType.EXTRA_TIME],
        testType: 'Car',
      });
    });

    test('renders the NSA booking confirmation page when in support mode with evidence maybe required', () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      mockCrmGateway.hasCRMSupportNeeds.mockReturnValue(false);
      determineEvidenceRoute.mockReturnValue(EvidencePath.EVIDENCE_MAY_BE_REQUIRED);

      bookingConfirmation.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_CONFIRMATION_EVIDENCE_MAY_BE_REQUIRED, {
        bookingRef: mockBookingRef,
        deafCandidate: undefined,
        inSupportMode: true,
        language: 'English',
        preferDay: 'To be decided later',
        preferLocation: 'To be decided later',
        supportTypes: [SupportType.EXTRA_TIME],
        testType: 'Car',
      });
    });

    test('renders the NSA booking confirmation page when in support mode with returning candidate', () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      mockCrmGateway.hasCRMSupportNeeds.mockReturnValue(false);
      determineEvidenceRoute.mockReturnValue(EvidencePath.RETURNING_CANDIDATE);

      bookingConfirmation.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_CONFIRMATION_RETURNING_CANDIDATE, {
        bookingRef: mockBookingRef,
        deafCandidate: undefined,
        inSupportMode: true,
        language: 'English',
        preferDay: 'To be decided later',
        preferLocation: 'To be decided later',
        supportTypes: [SupportType.EXTRA_TIME],
        testType: 'Car',
      });
    });

    test('missing booking on session', () => {
      delete req.session.currentBooking;

      expect(() => bookingConfirmation.get(req, res)).toThrow('BookingConfirmation::get: No currentBooking set');
    });

    test('resets the session', () => {
      bookingConfirmation.get(req, res);

      expect(req.session.candidate).toBeUndefined();
      expect(req.session.currentBooking).toBeUndefined();
    });

    test('throws error if candidate is not set', () => {
      delete req.session.candidate;

      expect(() => bookingConfirmation.get(req, res)).toThrow('BookingConfirmation::get: No candidate set');
    });
  });
});
