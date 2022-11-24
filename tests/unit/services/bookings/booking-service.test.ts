import { mock } from 'jest-mock-extended';

import { BookingService } from '../../../../src/services/bookings/booking-service';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { CRMBookingStatus } from '../../../../src/services/crm-gateway/enums';
import { BookingResponse } from '../../../../src/domain/booking/types';
import { SchedulingGateway } from '../../../../src/services/scheduling/scheduling-gateway';
import { Booking, Candidate } from '../../../../src/services/session';
import { mockCurrentBooking } from '../../../mocks/data/manage-bookings';
import { logger } from '../../../../src/helpers/logger';
import { CrmServerError } from '../../../../src/domain/errors/crm';

jest.mock('../../../../src/services/crm-gateway/crm-gateway');
jest.mock('../../../../src/services/scheduling/scheduling-gateway');
jest.mock('../../../../src/config');

describe('Booking service', () => {
  let bookingService: BookingService;
  let req: any;

  const mockScheduling = mock<SchedulingGateway>();
  const mockCrmGateway = mock<CRMGateway>();

  const receiptReference = '2f1e6ad1-f887-4772-8f4c-ec4aa61b21e2';

  const mockCandidate: Partial<Candidate> = {
    title: 'Mr',
    firstnames: 'Britney',
    surname: 'Arlene-Selenium',
    dateOfBirth: '2000-01-01',
    email: 'test@user.com',
    address: {
      line1: '24 Somewhere Street',
      line2: 'Somewhere',
      line3: 'Nowhere town',
      line4: undefined,
      line5: 'Birmingham',
      postcode: 'B5 1AA',
    },
    eligibilities: [],
    eligibleToBookOnline: true,
    behaviouralMarker: false,
  };

  let booking: Required<Pick<Booking, 'bookingId' | 'bookingProductId' | 'reservationId' | 'bookingRef' | 'bookingProductRef' | 'dateTime' | 'centre' | 'paymentId'>>;

  const mockBookingResponse: BookingResponse[] = [{
    reservationId: '12345678896858547',
    status: 'arlene',
    message: 'message',
  }];

  const lastRefundDate = '2021-05-13';

  beforeEach(() => {
    booking = {
      bookingId: mockCurrentBooking().bookingId,
      bookingProductId: mockCurrentBooking().bookingProductId,
      reservationId: mockCurrentBooking().reservationId,
      bookingRef: mockCurrentBooking().bookingRef,
      bookingProductRef: mockCurrentBooking().bookingProductRef,
      dateTime: mockCurrentBooking().dateTime,
      centre: mockCurrentBooking().centre,
    };
    bookingService = new BookingService(mockScheduling as unknown as SchedulingGateway, mockCrmGateway as any);
    req = {
      session: {
        currentBooking: {
          paymentId: undefined,
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('completeBooking', () => {
    describe('Given a booking and a candidate', () => {
      test('then it succcessfully completes a booking, confirming the slot, updating the booking status and sets the TCN Update Date', async () => {
        mockScheduling.confirmBooking.mockResolvedValue(mockBookingResponse);
        mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate.mockResolvedValue();
        mockCrmGateway.calculateThreeWorkingDays.mockResolvedValueOnce(lastRefundDate);

        const result = await bookingService.completeBooking(mockCandidate, booking, receiptReference);

        expect(mockScheduling.confirmBooking).toHaveBeenCalledWith([{
          bookingReferenceId: booking.bookingProductRef,
          reservationId: booking.reservationId,
          notes: '',
          behaviouralMarkers: '',
        }], booking.centre.region);
        expect(mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate).toHaveBeenCalledWith(
          booking.bookingId,
          booking.bookingProductId,
          CRMBookingStatus.Confirmed,
          receiptReference,
          false,
        );
        expect(mockCrmGateway.calculateThreeWorkingDays).toHaveBeenCalledWith(booking.dateTime, booking.centre.remit);
        expect(result).toStrictEqual({
          isConfirmed: true,
          lastRefundDate,
        });
      });

      test('when the booking slot could not be confirmed with the scheduling API then the booking is cancelled', async () => {
        const confirmBookingError = new Error('ManagedIdentityCredential authentication failed');
        mockScheduling.confirmBooking.mockRejectedValueOnce(confirmBookingError);

        const result = await bookingService.completeBooking(mockCandidate, booking);

        expect(mockScheduling.confirmBooking).toHaveBeenCalledWith([{
          bookingReferenceId: booking.bookingProductRef,
          reservationId: booking.reservationId,
          notes: '',
          behaviouralMarkers: '',
        }], booking.centre.region);
        expect(mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate).toHaveBeenCalledTimes(1);
        expect(mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate).toHaveBeenCalledWith(booking.bookingId, booking.bookingProductId, CRMBookingStatus.Draft, undefined);
        expect(mockCrmGateway.calculateThreeWorkingDays).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(confirmBookingError, expect.stringContaining('Error confirming booking slot with scheduling'), {
          bookingRef: booking.bookingRef,
          bookingId: booking.bookingId,
          bookingProductId: booking.bookingProductId,
          reservationId: booking.reservationId,
        });
        expect(result).toStrictEqual({
          isConfirmed: false,
          bookingRef: booking.bookingRef,
        });
      });

      test('when an error not related to confirming a booking with the scheduling API occurs then it is thrown', async () => {
        const genericError = new Error('Something went horribly wrong o_O');
        const crmRelatedError = new CrmServerError();
        mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate.mockRejectedValueOnce(genericError);

        await expect(bookingService.completeBooking(mockCandidate, booking, receiptReference)).rejects.toThrow(crmRelatedError);

        expect(mockScheduling.confirmBooking).toHaveBeenCalledWith([{
          bookingReferenceId: booking.bookingProductRef,
          reservationId: booking.reservationId,
          notes: '',
          behaviouralMarkers: '',
        }], booking.centre.region);
        expect(mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate).toHaveBeenCalledWith(
          booking.bookingId,
          booking.bookingProductId,
          CRMBookingStatus.Confirmed,
          receiptReference,
          false,
        );
        expect(mockCrmGateway.calculateThreeWorkingDays).not.toHaveBeenCalled();
      });
    });
  });

  describe('unreserveBooking', () => {
    test('when called with the required arguments then it successfully unreserves the booking slot and sets its status to Draft', async () => {
      await bookingService.unreserveBooking(booking.bookingProductRef, booking.centre.region, booking.bookingProductId, booking.bookingId, booking.reservationId, CRMBookingStatus.Draft);

      expect(mockScheduling.deleteReservation).toHaveBeenCalledWith(booking.reservationId, booking.centre.region, booking.bookingProductRef);
      expect(mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate).toHaveBeenCalledWith(booking.bookingId, booking.bookingProductId, CRMBookingStatus.Draft, undefined);
    });

    test('when the user cancels it should be called with the required arguments then it successfully unreserves the booking slot and sets its status to AbandonedNonRecoverable', async () => {
      req.session.currentBooking.paymentId = 'payment-id';
      await bookingService.unreserveBooking(booking.bookingProductRef, booking.centre.region, booking.bookingProductId, booking.bookingId, booking.reservationId, CRMBookingStatus.AbandonedNonRecoverable, req.session.currentBooking.paymentId);

      expect(mockScheduling.deleteReservation).toHaveBeenCalledWith(booking.reservationId, booking.centre.region, booking.bookingProductRef);
      expect(mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate).toHaveBeenCalledWith(booking.bookingId, booking.bookingProductId, CRMBookingStatus.AbandonedNonRecoverable, 'payment-id');
    });

    test('if scheduling api fails with a 500 status, error gets logged and swallowed so crm gateway can still be called', async () => {
      const error = new Error('mock scheduling is down');
      mockScheduling.deleteReservation.mockRejectedValue(error);

      await bookingService.unreserveBooking(booking.bookingProductRef, booking.centre.region, booking.bookingProductId, booking.bookingId, booking.reservationId, CRMBookingStatus.Draft);

      expect(mockScheduling.deleteReservation).toHaveBeenCalled();
      expect(mockCrmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('BookingService::unreserveBooking: Error when deleting reservation', {
        error,
        bookingId: 'mockBookingId',
        bookingProductId: 'mockBookingProductId',
        bookingProductRef: 'mockBookingProductRef',
      });
    });
  });
});
