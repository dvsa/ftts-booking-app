import { CandidateDetails } from '@dvsa/ftts-eligibility-api-model/dist/generated/candidateDetails';
import { v4 as uuidv4 } from 'uuid';
import { SchedulingGateway, ReservationResponse } from '../../../src/services/scheduling/scheduling-gateway';
import { CRMGateway } from '../../../src/services/crm-gateway/crm-gateway';
import { BookingHandler } from '../../../src/helpers/booking-handler';
import { Centre } from '../../../src/domain/types';
import { CRMAdditionalSupport } from '../../../src/services/crm-gateway/enums';
import { TestType, Voiceover } from '../../../src/domain/enums';
import { CandidateAndBookingResponse } from '../../../src/services/crm-gateway/interfaces';
import { Booking, Candidate } from '../../../src/services/session';
import { BusinessTelemetryEvents, logger } from '../../../src/helpers/logger';

jest.mock('../../../src/services/crm-gateway/crm-gateway', () => ({
  CRMGateway: {
    getInstance: () => ({
      getLicenceAndProduct: jest.fn(() => Promise.resolve()),
      createCandidateAndBooking: jest.fn(() => Promise.resolve()),
      createBooking: jest.fn(() => Promise.resolve()),
      updateCandidate: jest.fn(() => Promise.resolve()),
      createBookingProduct: jest.fn(() => Promise.resolve()),
      getCandidateByLicenceNumber: jest.fn(() => Promise.resolve()),
    }),
  },
}));

jest.mock('../../../src/services/payments/payment-helper', () => ({
  buildPaymentReference: () => 'mock-payment-ref',
}));

const mockPriceListId = '';

const candidate: Candidate = {
  candidateId: uuidv4(),
  title: 'Mrs',
  gender: CandidateDetails.GenderEnum.F,
  address: {
    line1: '42 Somewhere Street',
    line2: 'This Village',
    line3: 'This County',
    line4: 'Nowhere',
    line5: 'Birmingham',
    postcode: 'B5 1AA',
  },
  eligibleToBookOnline: true,
  behaviouralMarker: false,
  firstnames: 'Farrokh',
  surname: 'Bulsara',
  dateOfBirth: '1946-09-05',
  licenceNumber: 'QUEEN061102W97YT',
  email: 'freddymercury@queen.co.uk',
  telephone: mockPriceListId,
  eligibilities: [],
  personReference: '123456789',
  licenceId: 'licence-id',
} as Candidate;

const currentBooking: Booking = {
  centre: {
    siteId: 'siteId',
    accountId: 'accountId',
  } as Centre,
  testType: TestType.CAR,
  voiceover: Voiceover.WELSH,
  dateTime: '2020-12-31T12:00:00Z',
  salesReference: 'mock-payment-ref',
} as Booking;

describe('Booking handler', () => {
  const scheduling = SchedulingGateway.prototype;
  let crmGateway: CRMGateway;
  let req: any;

  beforeEach(() => {
    crmGateway = CRMGateway.getInstance();
    req = {
      session: {
        journey: {
          standardAccommodation: true,
        },
        candidate: {
          ...candidate,
        },
        currentBooking: {
          ...currentBooking,
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create booking', () => {
    test('successfully reserves a slot and creates a booking and booking product in CRM', async () => {
      const reservationId = uuidv4();
      const mockCandidateAndBookingResponse: CandidateAndBookingResponse = {
        booking: {
          id: 'booking-id',
          reference: 'booking-ref',
        },
        candidate,
      };
      scheduling.reserveSlot = jest.fn().mockImplementationOnce((centre: Centre, startDateTime: string): Promise<ReservationResponse> => Promise.resolve({
        testCentreId: centre.testCentreId,
        testTypes: ['car'],
        startDateTime,
        reservationId,
      }));
      crmGateway.updateCandidateAndCreateBooking = jest.fn().mockResolvedValue(mockCandidateAndBookingResponse);
      crmGateway.createBookingProduct = jest.fn().mockResolvedValue('booking-product-id');

      const bookingHandler: BookingHandler = new BookingHandler(crmGateway, req, scheduling);
      await bookingHandler.createBooking();

      expect(scheduling.reserveSlot).toHaveBeenCalledWith({ siteId: 'siteId', accountId: 'accountId' }, TestType.CAR, currentBooking.dateTime);
      expect(crmGateway.updateCandidateAndCreateBooking).toHaveBeenCalledWith(
        candidate,
        currentBooking,
        CRMAdditionalSupport.VoiceoverWelsh,
        req.session.journey.standardAccommodation,
        mockPriceListId,
      );
      expect(crmGateway.createBookingProduct).toHaveBeenCalledWith(
        {
          ...candidate,
        },
        currentBooking,
        mockCandidateAndBookingResponse.booking,
        req.session.journey.standardAccommodation,
        CRMAdditionalSupport.VoiceoverWelsh,
      );
      expect(req.session.currentBooking.bookingRef).toEqual(mockCandidateAndBookingResponse.booking.reference);
      expect(req.session.currentBooking.bookingProductRef).toEqual(`${mockCandidateAndBookingResponse.booking.reference}-01`);
      expect(req.session.currentBooking.bookingId).toEqual(mockCandidateAndBookingResponse.booking.id);
      expect(req.session.currentBooking.bookingProductId).toEqual('booking-product-id');
      expect(req.session.currentBooking.reservationId).toEqual(reservationId);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.SCHEDULING_RESERVATION_SUCCESS,
        'BookingHandler::reserveBooking: Successfully reserved a slot for the booking',
        {
          candidateId: candidate.candidateId,
          dateTime: '2020-12-31T12:00:00Z',
          licenceId: 'licence-id',
          reservationId,
          testCentre: {
            siteId: 'siteId',
            accountId: 'accountId',
          },
          testType: 'car',
        },
      );
    });

    test('NSA booking gets created with an updated telephone number supplied', async () => {
      req.session.journey.standardAccommodation = false;
      candidate.telephone = '123 456 7890';
      req.session.candidate.telephone = '123 456 7890';

      const mockBookingAndCandidateResponse: CandidateAndBookingResponse = {
        booking: {
          id: uuidv4(),
          reference: 'booking-reference-2',
        },
        candidate,
      };

      const mockBookingID = 'REF00001';

      scheduling.reserveSlot = jest.fn();
      crmGateway.updateCandidateAndCreateBooking = jest.fn().mockResolvedValue(mockBookingAndCandidateResponse);
      crmGateway.createBookingProduct = jest.fn().mockResolvedValue(mockBookingID);

      const bookingHandler: BookingHandler = new BookingHandler(crmGateway, req);
      await bookingHandler.createBooking();

      expect(scheduling.reserveSlot).not.toHaveBeenCalled();
      expect(crmGateway.updateCandidateAndCreateBooking).toHaveBeenCalledWith(
        candidate,
        currentBooking,
        CRMAdditionalSupport.VoiceoverWelsh,
        req.session.journey.standardAccommodation,
        mockPriceListId,
      );
      expect(crmGateway.createBookingProduct).toHaveBeenCalledWith(
        {
          ...candidate,
          candidateId: candidate.candidateId,
          licenceId: candidate.licenceId,
        },
        currentBooking,
        mockBookingAndCandidateResponse.booking,
        req.session.journey.standardAccommodation,
        CRMAdditionalSupport.VoiceoverWelsh,
      );
    });

    test('Booking gets created when candidate chooses BSL in standard journey', async () => {
      req.session.journey.standardAccommodation = true;
      req.session.currentBooking.voiceover = Voiceover.NONE;
      req.session.currentBooking.bsl = true;

      const mockBookingAndCandidateResponse: CandidateAndBookingResponse = {
        booking: {
          id: uuidv4(),
          reference: 'booking-reference-2',
        },
        candidate,
      };

      const mockBookingID = 'REF00001';

      scheduling.reserveSlot = jest.fn();
      crmGateway.updateCandidateAndCreateBooking = jest.fn().mockResolvedValue(mockBookingAndCandidateResponse);
      crmGateway.createBookingProduct = jest.fn().mockResolvedValue(mockBookingID);

      const bookingHandler: BookingHandler = new BookingHandler(crmGateway, req);
      await bookingHandler.createBooking();

      expect(crmGateway.updateCandidateAndCreateBooking).toHaveBeenCalledWith(
        candidate,
        {
          ...currentBooking,
          voiceover: Voiceover.NONE,
          bsl: true,
        },
        CRMAdditionalSupport.BritishSignLanguage,
        req.session.journey.standardAccommodation,
        mockPriceListId,
      );
    });

    test('Booking gets created when candidate chooses English voiceover in NSA journey', async () => {
      req.session.journey.standardAccommodation = false;
      req.session.currentBooking.voiceover = Voiceover.ENGLISH;

      const mockBookingAndCandidateResponse: CandidateAndBookingResponse = {
        booking: {
          id: uuidv4(),
          reference: 'booking-reference-2',
        },
        candidate,
      };

      const mockBookingID = 'REF00001';

      scheduling.reserveSlot = jest.fn();
      crmGateway.updateCandidateAndCreateBooking = jest.fn().mockResolvedValue(mockBookingAndCandidateResponse);
      crmGateway.createBookingProduct = jest.fn().mockResolvedValue(mockBookingID);

      const bookingHandler: BookingHandler = new BookingHandler(crmGateway, req);
      await bookingHandler.createBooking();

      expect(crmGateway.updateCandidateAndCreateBooking).toHaveBeenCalledWith(
        candidate,
        {
          ...currentBooking,
          voiceover: Voiceover.ENGLISH,
        },
        CRMAdditionalSupport.VoiceoverEnglish,
        req.session.journey.standardAccommodation,
        mockPriceListId,
      );
    });

    test('Booking gets created when candidate chooses no support in standard journey', async () => {
      req.session.journey.standardAccommodation = true;
      req.session.currentBooking.voiceover = Voiceover.NONE;

      const mockBookingAndCandidateResponse: CandidateAndBookingResponse = {
        booking: {
          id: uuidv4(),
          reference: 'booking-reference-2',
        },
        candidate,
      };

      const mockBookingID = 'REF00001';

      scheduling.reserveSlot = jest.fn();
      crmGateway.updateCandidateAndCreateBooking = jest.fn().mockResolvedValue(mockBookingAndCandidateResponse);
      crmGateway.createBookingProduct = jest.fn().mockResolvedValue(mockBookingID);

      const bookingHandler: BookingHandler = new BookingHandler(crmGateway, req);
      await bookingHandler.createBooking();

      expect(crmGateway.updateCandidateAndCreateBooking).toHaveBeenCalledWith(
        candidate,
        {
          ...currentBooking,
          voiceover: Voiceover.NONE,
        },
        CRMAdditionalSupport.None,
        req.session.journey.standardAccommodation,
        mockPriceListId,
      );
    });

    test('errors when reserving a booking with scheduling API fails', async () => {
      scheduling.reserveSlot = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('expected error')));
      const mockedCrmGateway = {
        updateCandidateAndCreateBooking: jest.fn(),
        createBookingProduct: jest.fn(),
      };

      const bookingHandler: BookingHandler = new BookingHandler(mockedCrmGateway as unknown as CRMGateway, req, scheduling);

      await expect(bookingHandler.createBooking()).rejects.toThrow('expected error');
      expect(mockedCrmGateway.updateCandidateAndCreateBooking).not.toHaveBeenCalled();
      expect(mockedCrmGateway.createBookingProduct).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('missing candidate on init', () => {
      req.session.candidate = undefined;

      expect(() => new BookingHandler(crmGateway, req, scheduling)).toThrow(Error('BookingHandler::constructor: No candidate set'));
    });

    test('missing booking on init', () => {
      req.session.currentBooking = undefined;

      expect(() => new BookingHandler(crmGateway, req, scheduling)).toThrow(Error('BookingHandler::constructor: No currentBooking set'));
    });

    test('missing journey on init', () => {
      req.session.journey = undefined;

      expect(() => new BookingHandler(crmGateway, req, scheduling)).toThrow(Error('BookingHandler::constructor: No journey set'));
    });

    test('missing standardAccommodation on init', () => {
      req.session.journey.standardAccommodation = undefined;

      expect(() => new BookingHandler(crmGateway, req, scheduling)).toThrow(Error('BookingHandler::constructor: No journey set'));
    });

    test('reservation catches booking missing data', async () => {
      delete req.session.currentBooking.dateTime;

      const bookingHandler: BookingHandler = new BookingHandler(crmGateway, req, scheduling);

      await expect(bookingHandler.createBooking())
        .rejects
        .toThrow(Error('BookingHandler::reserveBooking: No booking params set'));
    });

    test('reservation catches candidate missing data', async () => {
      scheduling.reserveSlot = jest.fn().mockImplementationOnce((centre: Centre, startDateTime: string): Promise<ReservationResponse> => Promise.resolve({
        testCentreId: centre.testCentreId,
        testTypes: ['car'],
        startDateTime,
        reservationId: 'abcd-1234-erty',
      }));
      delete req.session.candidate.licenceNumber;

      const bookingHandler: BookingHandler = new BookingHandler(crmGateway, req, scheduling);

      await expect(bookingHandler.createBooking())
        .rejects
        .toThrow(Error('BookingHandler::createEntities: No booking params set'));
    });
  });
});
