import { Scheduler, ReservationResponse } from '../../../../src/services/scheduling/scheduling-service';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { BookingHandler } from '../../../../src/pages/check-your-answers/booking-handler';
import { Centre } from '../../../../src/domain/types';
import { CRMAdditionalSupport } from '../../../../src/services/crm-gateway/enums';
import { TestType, Voiceover } from '../../../../src/domain/enums';
import { CandidateAndBookingResponse, LicenceAndProductResponse, BookingResponse } from '../../../../src/services/crm-gateway/interfaces';
import { Booking, Candidate } from '../../../../src/services/session';

jest.mock('../../../../src/services/crm-gateway/crm-gateway', () => ({
  CRMGateway: {
    getInstance: () => ({
      getLicenceAndProduct: jest.fn(() => Promise.resolve()),
      createCandidateAndBooking: jest.fn(() => Promise.resolve()),
      createBooking: jest.fn(() => Promise.resolve()),
      createBookingProduct: jest.fn(() => Promise.resolve()),
      getCandidateByLicenceNumber: jest.fn(() => Promise.resolve()),
    }),
  },
}));

jest.mock('../../../../src/services/payments/payment-helper', () => ({
  buildPaymentReference: () => 'mock-payment-ref',
  buildPersonReference: () => '123456789',
}));

const uuid = '8a6a111f-4bc4-491d-bf86-c479f7195ce0';

const candidate: Candidate = {
  firstnames: 'Farrokh',
  surname: 'Bulsara',
  dateOfBirth: '1946-09-05',
  licenceNumber: 'QUEEN061102W97YT',
  email: 'freddymercury@queen.co.uk',
  entitlements: '',
  personReference: '123456789',
} as Candidate;

const currentBooking: Booking = {
  centre: {
    siteId: 'siteId',
    accountId: 'accountId',
  } as Centre,
  testType: TestType.Car,
  voiceover: Voiceover.WELSH,
  dateTime: '2020-12-31T12:00:00Z',
  salesReference: 'mock-payment-ref',
} as Booking;

describe('Booking handler', () => {
  const scheduling = Scheduler.prototype;
  let crmGateway: CRMGateway;
  let req: any;

  beforeEach(() => {
    crmGateway = CRMGateway.getInstance();
    req = {
      session: {
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
    test('sucessfully reserves a slot and creates a candidate, licence, booking and booking product in CRM', async () => {
      const mockLicenceAndProductResponse: LicenceAndProductResponse = {
        licence: undefined,
        product: { id: '123456', parentId: '987654' },
      };
      const mockCandidateAndBookingResponse: CandidateAndBookingResponse = {
        booking: { id: 'booking-id', reference: 'booking-ref' },
        licence: { candidateId: 'candidate-id', licenceId: 'licence-id' },
      };
      scheduling.reserveSlot = jest.fn().mockImplementationOnce((centre: Centre, startDateTime: string): Promise<ReservationResponse> => Promise.resolve({
        testCentreId: centre.testCentreId,
        testTypes: ['car'],
        startDateTime,
        reservationId: uuid,
      }));
      crmGateway.getLicenceAndProduct = jest.fn().mockResolvedValue(mockLicenceAndProductResponse);
      crmGateway.createCandidateAndBooking = jest.fn().mockResolvedValue(mockCandidateAndBookingResponse);
      crmGateway.createBookingProduct = jest.fn().mockResolvedValue('booking-product-id');

      const bookingHandler: BookingHandler = new BookingHandler(scheduling, crmGateway, req);
      await bookingHandler.createBooking();

      expect(scheduling.reserveSlot).toBeCalledWith({ siteId: 'siteId', accountId: 'accountId' }, TestType.Car, '2020-12-31T12:00:00Z');
      expect(crmGateway.getLicenceAndProduct).toBeCalledWith('QUEEN061102W97YT', 0);
      expect(crmGateway.createCandidateAndBooking).toBeCalledWith(candidate, currentBooking, CRMAdditionalSupport.None);
      expect(crmGateway.createBookingProduct).toBeCalledWith(
        {
          ...candidate,
          candidateId: mockCandidateAndBookingResponse.licence.candidateId,
          licenceId: mockCandidateAndBookingResponse.licence.licenceId,
        },
        currentBooking,
        mockLicenceAndProductResponse.product,
        mockCandidateAndBookingResponse.booking,
      );
      expect(req.session.currentBooking.bookingRef).toEqual(mockCandidateAndBookingResponse.booking.reference);
      expect(req.session.currentBooking.bookingId).toEqual(mockCandidateAndBookingResponse.booking.id);
      expect(req.session.currentBooking.bookingProductId).toEqual('booking-product-id');
      expect(req.session.currentBooking.reservationId).toEqual(uuid);
      expect(crmGateway.createBooking).not.toHaveBeenCalled();
    });

    test('sucessfully reserves a slot and creates a booking and booking product in CRM', async () => {
      const mockLicenceAndProductResponse: LicenceAndProductResponse = {
        licence: { licenceId: 'licence-id-2', candidateId: 'candidate-id-2' },
        product: { id: 'product-id-2', parentId: 'parent-product-id-2' },
      };
      const mockBookingResponse: BookingResponse = {
        id: 'booking-id-2',
        reference: 'booking-reference-2',
      };
      scheduling.reserveSlot = jest.fn().mockImplementationOnce((centre: Centre, startDateTime: string): Promise<ReservationResponse> => Promise.resolve({
        testCentreId: centre.testCentreId,
        testTypes: ['car'],
        startDateTime,
        reservationId: uuid,
      }));
      crmGateway.getLicenceAndProduct = jest.fn().mockResolvedValue(mockLicenceAndProductResponse);
      crmGateway.createBooking = jest.fn().mockResolvedValue(mockBookingResponse);
      crmGateway.createBookingProduct = jest.fn().mockResolvedValue('booking-product-id');
      crmGateway.getCandidateByLicenceNumber = jest.fn().mockResolvedValueOnce(candidate);

      const bookingHandler: BookingHandler = new BookingHandler(scheduling, crmGateway, req);
      await bookingHandler.createBooking();

      expect(scheduling.reserveSlot).toBeCalledWith({ siteId: 'siteId', accountId: 'accountId' }, TestType.Car, '2020-12-31T12:00:00Z');
      expect(crmGateway.getLicenceAndProduct).toBeCalledWith('QUEEN061102W97YT', 0);
      expect(crmGateway.createBooking).toBeCalledWith(
        {
          ...candidate,
          candidateId: mockLicenceAndProductResponse.licence.candidateId,
          licenceId: mockLicenceAndProductResponse.licence.licenceId,
        },
        currentBooking,
        CRMAdditionalSupport.None,
      );
      expect(crmGateway.createBookingProduct).toBeCalledWith(
        {
          ...candidate,
          candidateId: mockLicenceAndProductResponse.licence.candidateId,
          licenceId: mockLicenceAndProductResponse.licence.licenceId,
        },
        currentBooking,
        mockLicenceAndProductResponse.product,
        mockBookingResponse,
      );
      expect(req.session.currentBooking.bookingRef).toEqual(mockBookingResponse.reference);
      expect(req.session.currentBooking.bookingId).toEqual(mockBookingResponse.id);
      expect(req.session.currentBooking.bookingProductId).toEqual('booking-product-id');
      expect(req.session.currentBooking.reservationId).toEqual(uuid);
      expect(crmGateway.createCandidateAndBooking).not.toHaveBeenCalled();
    });

    it('errors when reserving a booking with scheduling API fails', () => {
      scheduling.reserveSlot = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('expected error')));

      const bookingHandler: BookingHandler = new BookingHandler(scheduling, crmGateway, req);

      expect(bookingHandler.createBooking()).rejects.toThrow('expected error');
      expect(crmGateway.getLicenceAndProduct).not.toHaveBeenCalled();
      expect(crmGateway.createBooking).not.toHaveBeenCalled();
      expect(crmGateway.createCandidateAndBooking).not.toHaveBeenCalled();
      expect(crmGateway.createBookingProduct).not.toHaveBeenCalled();
    });
  });
});
