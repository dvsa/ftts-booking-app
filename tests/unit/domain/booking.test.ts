import MockDate from 'mockdate';

import { Booking, byTestDateSoonestFirst } from '../../../src/domain/booking/booking';
import { TestType } from '../../../src/domain/enums';
import {
  CRMBookingStatus, CRMFinanceTransactionStatus, CRMPaymentStatus, CRMRemit, CRMTestLanguage, CRMTransactionType, CRMVoiceOver,
} from '../../../src/services/crm-gateway/enums';
import { BookingDetails } from '../../../src/services/crm-gateway/interfaces';

describe('Booking domain entity', () => {
  const mockToday = '2020-11-11T12:00:00.000Z';
  let details: BookingDetails;

  beforeEach(() => {
    MockDate.set(mockToday); // Set mocked date/time for 'now'

    details = {
      bookingProductId: 'mockBookingProductId',
      reference: 'mockRef',
      bookingId: 'mockBookingId',
      bookingStatus: CRMBookingStatus.Confirmed,
      testDate: '2020-10-29T14:00:00.000Z',
      testLanguage: CRMTestLanguage.English,
      voiceoverLanguage: CRMVoiceOver.None,
      additionalSupport: null,
      paymentStatus: null,
      price: 23,
      salesReference: 'mockSalesRef',
      testType: TestType.Car,
      origin: 1,
      testCentre: {
        name: 'mockTestCentreName',
        addressLine1: 'mockTestCentreAddress1',
        addressLine2: 'mockTestCentreAddress2',
        addressCity: 'mockTestCentreCity',
        addressPostalCode: 'mockTestCentrePostcode',
        remit: CRMRemit.England,
      },
      payment: {
        paymentId: 'mock-payment-id',
        paymentStatus: CRMPaymentStatus.Success,
      },
      financeTransaction: {
        financeTransactionId: 'mock-finance-transaction-id',
        transactionType: CRMTransactionType.Booking,
        transactionStatus: CRMFinanceTransactionStatus.Deferred,
      },
    };
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

    test('returns false if booking has a different status', () => {
      details.bookingStatus = CRMBookingStatus.Reserved;
      const booking = Booking.from(details);

      expect(booking.isViewable()).toBe(false);
    });
  });

  describe('isConfirmed', () => {
    test('returns true if the booking has status \'Confirmed\'', () => {
      details.bookingStatus = CRMBookingStatus.Confirmed;
      const booking = Booking.from(details);

      expect(booking.isConfirmed()).toBe(true);
    });
  });

  describe('isCancellationInProgress', () => {
    test('returns true if the booking has status Cancellation in Progress a Payment Status that is not Refunded and Transaction Status of Deferred ', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      details.payment.paymentStatus = CRMPaymentStatus.Success;
      details.financeTransaction.transactionStatus = CRMFinanceTransactionStatus.Deferred;
      const booking = Booking.from(details);

      expect(booking.isCancellationInProgress()).toBe(true);
    });

    test('returns false if the booking status is not Cancellation in Progress', () => {
      details.bookingStatus = CRMBookingStatus.Cancelled;
      details.payment.paymentStatus = CRMPaymentStatus.Success;
      details.financeTransaction.transactionStatus = CRMFinanceTransactionStatus.Deferred;
      const booking = Booking.from(details);

      expect(booking.isCancellationInProgress()).toBe(false);
    });

    test('returns false if the payment status is Refunded', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      details.payment.paymentStatus = CRMPaymentStatus.Refunded;
      details.financeTransaction.transactionStatus = CRMFinanceTransactionStatus.Deferred;
      const booking = Booking.from(details);

      expect(booking.isCancellationInProgress()).toBe(false);
    });

    test('returns false if the finance transaction status is recognised', () => {
      details.bookingStatus = CRMBookingStatus.CancellationInProgress;
      details.payment.paymentStatus = CRMPaymentStatus.Success;
      details.financeTransaction.transactionStatus = CRMFinanceTransactionStatus.Recognised;
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

  describe('canBeCancelled', () => {
    test('returns true if the booking test date is in the future but not today', () => {
      details.testDate = '2020-11-12T15:45:00.000Z';
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
  });

  describe('isRefundable/canBeRescheduled', () => {
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
