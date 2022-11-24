import MockDate from 'mockdate';

import { Booking, byTestDateSoonestFirst } from '../../../src/domain/booking/booking';
import {
  CRMBookingStatus, CRMFinanceTransactionStatus, CRMPaymentStatus,
} from '../../../src/services/crm-gateway/enums';
import { BookingDetails } from '../../../src/services/crm-gateway/interfaces';
import { mockManageBooking } from '../../mocks/data/manage-bookings';

describe('Booking domain entity', () => {
  const mockToday = '2020-11-11T12:00:00.000Z';
  let details: BookingDetails;

  beforeEach(() => {
    MockDate.set(mockToday); // Set mocked date/time for 'now'
    details = mockManageBooking();
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('isViewable', () => {
    test('returns true if the booking has status \'Confirmed\' and is not in the past', () => {
      details.bookingStatus = CRMBookingStatus.Confirmed;
      details.testDate = '2020-11-11T13:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(true);
    });

    test('returns false if booking has the status \'Confirmed\' and is in the past', () => {
      details.bookingStatus = CRMBookingStatus.Confirmed;
      details.testDate = '2020-11-11T10:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(false);
    });

    test('returns true if the booking has status \'Cancellation in Progress\' and is not in the past', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      (details.financeTransaction as Record<string, unknown>).transactionStatus = CRMFinanceTransactionStatus.Deferred;
      details.testDate = '2020-11-11T13:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(true);
    });

    test('returns false if booking has the status \'Cancellation in Progress\' and is in the past', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      details.testDate = '2020-11-11T10:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(false);
    });

    test('returns true if the booking has status \'Change in Progress\' and is not in the past', () => {
      details.bookingStatus = CRMBookingStatus.ChangeInProgress;
      details.testDate = '2020-11-11T13:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(true);
    });

    test('returns false if booking has the status \'Change in Progress\' and is in the past', () => {
      details.bookingStatus = CRMBookingStatus.ChangeInProgress;
      details.testDate = '2020-11-11T10:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(false);
    });

    test('returns true if the booking has status \'Draft\' and is a NSA test and is not in the past', () => {
      details.bookingStatus = CRMBookingStatus.Draft;
      details.nonStandardAccommodation = true;
      details.testDate = '2020-11-11T13:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(true);
    });

    test('returns false if booking has the status \'Draft\' and is in the past', () => {
      details.bookingStatus = CRMBookingStatus.Draft;
      details.testDate = '2020-11-11T10:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(false);
    });

    test('returns false if booking has the status \'Draft\', is not in the past but is a standard booking', () => {
      details.bookingStatus = CRMBookingStatus.Draft;
      details.testDate = '2020-11-11T13:00:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(false);
    });

    test('returns false if booking has a different status', () => {
      details.bookingStatus = CRMBookingStatus.Reserved;
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(false);
    });

    test('returns true if the booking has status \'Cancelled\', is not in the past and is owed a compensation booking', () => {
      details.bookingStatus = CRMBookingStatus.Cancelled;
      details.testDate = '2020-11-11T13:00:00.000Z';
      details.owedCompensationBooking = true;
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(true);
    });

    test('returns true if the booking has status \'Cancelled\', is in the past and is owed a compensation booking', () => {
      details.bookingStatus = CRMBookingStatus.Cancelled;
      details.testDate = '2020-11-11T11:00:00.000Z';
      details.owedCompensationBooking = true;
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(true);
    });
  });

  describe('isZeroCost', () => {
    test('returns true if the booking is a zero cost booking', () => {
      details.isZeroCostBooking = true;
      const booking = Booking.from(details);

      expect(booking.isZeroCost()).toBe(true);
    });

    test('returns false if the booking is a zero cost booking', () => {
      details.isZeroCostBooking = false;
      const booking = Booking.from(details);

      expect(booking.isZeroCost()).toBe(false);
    });

    test('returns false if the booking has a null zero cost flag', () => {
      details.isZeroCostBooking = null;
      const booking = Booking.from(details);

      expect(booking.isZeroCost()).toBe(false);
    });
  });

  describe('isConfirmed', () => {
    test('returns true if the booking has status \'Confirmed\'', () => {
      details.bookingStatus = CRMBookingStatus.Confirmed;
      const booking = Booking.from(details);

      expect(booking.isConfirmed()).toBe(true);
    });
  });

  describe('isDraft', () => {
    test('returns true if the booking has status \'Draft\'', () => {
      details.bookingStatus = CRMBookingStatus.Draft;
      const booking = Booking.from(details);

      expect(booking.isDraft()).toBe(true);
    });
    test('returns false if the booking has status of anything other than \'Draft\'', () => {
      details.bookingStatus = CRMBookingStatus.Confirmed;
      const booking = Booking.from(details);

      expect(booking.isDraft()).toBe(false);
    });
  });

  describe('isCancellationInProgress', () => {
    test('returns true if the booking has status Cancellation in Progress a Payment Status that is not Refunded and Transaction Status of Deferred', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      details.paymentStatus = CRMPaymentStatus.Success;
      (details.financeTransaction as Record<string, unknown>).transactionStatus = CRMFinanceTransactionStatus.Deferred;
      const booking = Booking.from(details);

      expect(booking.isCancellationInProgress()).toBe(true);
    });

    test('returns false if the booking status is not Cancellation in Progress', () => {
      details.bookingStatus = CRMBookingStatus.Cancelled;
      details.paymentStatus = CRMPaymentStatus.Success;
      (details.financeTransaction as Record<string, unknown>).transactionStatus = CRMFinanceTransactionStatus.Deferred;
      const booking = Booking.from(details);

      expect(booking.isCancellationInProgress()).toBe(false);
    });

    test('returns false if the payment status is Refunded', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      details.paymentStatus = CRMPaymentStatus.Refunded;
      (details.financeTransaction as Record<string, unknown>).transactionStatus = CRMFinanceTransactionStatus.Deferred;
      const booking = Booking.from(details);

      expect(booking.isCancellationInProgress()).toBe(false);
    });

    test('returns false if the finance transaction status is recognised', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      details.paymentStatus = CRMPaymentStatus.Success;
      (details.financeTransaction as Record<string, unknown>).transactionStatus = CRMFinanceTransactionStatus.Recognised;
      const booking = Booking.from(details);

      expect(booking.isCancellationInProgress()).toBe(false);
    });
  });

  describe('isInThePast', () => {
    test('returns true if the booking test date/time is in the past', () => {
      details.testDate = '2020-10-29T11:30:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isInThePast()).toBe(true);
    });

    test('returns false otherwise', () => {
      details.testDate = '2020-12-14T15:45:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isInThePast()).toBe(false);
    });
  });

  describe('testIsToday', () => {
    test('returns true if the booking test date is today', () => {
      details.testDate = mockToday;
      const booking = Booking.from(details);

      expect(booking.testIsToday()).toBe(true);
    });

    test('returns false otherwise', () => {
      details.testDate = '2020-11-24T15:45:00.000Z';
      const booking = Booking.from(details);

      expect(booking.testIsToday()).toBe(false);
    });
  });

  describe('isCreatedToday', () => {
    test('returns true if the booking was created today', () => {
      details.createdOn = mockToday;
      const booking = Booking.from(details);

      expect(booking.isCreatedToday()).toBe(true);
    });

    test('returns false otherwise', () => {
      details.createdOn = '2020-11-24T15:45:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isCreatedToday()).toBe(false);
    });
  });

  describe('canBeChanged', () => {
    test('returns true if booking is standard accommodation', () => {
      details.nonStandardAccommodation = false;
      const booking = Booking.from(details);

      expect(booking.canBeChanged()).toBe(true);
    });

    test('returns false if booking is non-standard accommodation', () => {
      details.nonStandardAccommodation = true;
      const booking = Booking.from(details);

      expect(booking.canBeChanged()).toBe(false);
    });

    test('throw an error if non standard accommodation flag is missing', () => {
      delete details.nonStandardAccommodation;
      const booking = Booking.from(details);

      expect(() => booking.canBeChanged()).toThrow(Error);
    });
  });

  describe('canBeCancelled', () => {
    test('returns true if the booking test date is in the future but not today and test is not an NSA booking', () => {
      details.testDate = '2020-11-12T15:45:00.000Z';
      details.nonStandardAccommodation = false;
      const booking = Booking.from(details);

      expect(booking.canBeCancelled()).toBe(true);
    });

    test('returns false if the booking test date is today', () => {
      details.testDate = mockToday;
      const booking = Booking.from(details);

      expect(booking.canBeCancelled()).toBe(false);
    });

    test('returns false if the booking test date is in the past', () => {
      details.testDate = '2020-11-10T15:45:00.000Z';
      const booking = Booking.from(details);

      expect(booking.canBeCancelled()).toBe(false);
    });

    test('returns false if the booking is non standard', () => {
      details.nonStandardAccommodation = true;
      const booking = Booking.from(details);

      expect(booking.canBeCancelled()).toBe(false);
    });

    test('returns false if the booking was created today', () => {
      details.testDate = '2020-11-16T15:45:00.000Z';
      details.createdOn = mockToday;
      details.nonStandardAccommodation = false;
      const booking = Booking.from(details);

      expect(booking.canBeCancelled()).toBe(false);
    });

    test('throw an error if non standard accommodation flag is missing', () => {
      delete details.nonStandardAccommodation;
      const booking = Booking.from(details);

      expect(() => booking.canBeCancelled()).toThrow(Error);
    });
  });

  describe('isRefundable', () => {
    test('returns true if today is 3 working days clear of the booking test date', () => {
      details.testDateMinus3ClearWorkingDays = '2020-11-15T15:45:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isRefundable()).toBe(true);
    });

    test('returns false if the booking test date is today', () => {
      details.testDate = mockToday;
      const booking = Booking.from(details);

      expect(booking.isRefundable()).toBe(false);
    });

    test('returns false if today is not 3 working days clear of the booking test date', () => {
      details.testDateMinus3ClearWorkingDays = '2020-11-10T15:45:00.000Z';
      const booking = Booking.from(details);

      expect(booking.isRefundable()).toBe(false);
    });

    test('throws an error if missing the value of 3 working days prior to test date', () => {
      delete details.testDateMinus3ClearWorkingDays;
      const booking = Booking.from(details);

      expect(() => booking.isRefundable()).toThrow(Error);
    });
  });

  describe('canBeRescheduled', () => {
    test('returns true if today is 3 working days clear of the booking test date, has not bypassed eligibility and is not an NSA booking', () => {
      details.testDateMinus3ClearWorkingDays = '2020-11-15T15:45:00.000Z';
      details.enableEligibilityBypass = false;
      details.nonStandardAccommodation = false;
      const booking = Booking.from(details);

      expect(booking.canBeRescheduled()).toBe(true);
    });

    test('returns false if today is 3 working days clear of the booking test date, has not bypassed eligibility but is an NSA booking', () => {
      details.testDateMinus3ClearWorkingDays = '2020-11-15T15:45:00.000Z';
      details.enableEligibilityBypass = false;
      details.nonStandardAccommodation = true;
      const booking = Booking.from(details);

      expect(booking.canBeRescheduled()).toBe(false);
    });

    test('returns false if today is 3 working days clear of the booking test date, has bypassed eligibility and is not an NSA booking', () => {
      details.testDateMinus3ClearWorkingDays = '2020-11-15T15:45:00.000Z';
      details.enableEligibilityBypass = true;
      details.nonStandardAccommodation = false;
      const booking = Booking.from(details);

      expect(booking.canBeRescheduled()).toBe(false);
    });

    test('returns false if today is not 3 working days clear of the booking test date, has not bypassed eligibility and is not an NSA booking', () => {
      details.testDateMinus3ClearWorkingDays = '2020-11-10T15:45:00.000Z';
      details.enableEligibilityBypass = null;
      details.nonStandardAccommodation = false;
      const booking = Booking.from(details);

      expect(booking.canBeRescheduled()).toBe(false);
    });

    test('throws an error if missing the value of 3 working days prior to test date', () => {
      delete details.testDateMinus3ClearWorkingDays;
      const booking = Booking.from(details);

      expect(() => booking.canBeRescheduled()).toThrow(Error);
    });

    test('throw an error if non standard accommodation flag is missing', () => {
      delete details.nonStandardAccommodation;
      const booking = Booking.from(details);

      expect(() => booking.canBeRescheduled()).toThrow(Error);
    });
  });

  describe('byTestDateSoonestFirst compare function helper', () => {
    test('when used with Array sort, sorts Bookings by test date soonest first', () => {
      const booking1 = Booking.from({
        ...details,
        testDate: '2020-11-11T12:00:00.000Z',
      });
      const booking = Booking.from({
        ...details,
        testDate: '2020-11-11T12:00:00.000Z',
      });
      const bookings = [booking1, booking];

      bookings.sort(byTestDateSoonestFirst);

      expect(bookings).toStrictEqual([booking, booking1]);
    });
  });
});
