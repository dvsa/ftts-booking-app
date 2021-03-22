import dayjs from 'dayjs';
import { BookingDetails } from '../../services/crm-gateway/interfaces';
import { CRMBookingStatus, CRMFinanceTransactionStatus, CRMPaymentStatus } from '../../services/crm-gateway/enums';

export class Booking {
  public static from(details: BookingDetails): Booking {
    return new Booking(details);
  }

  constructor(
    public details: Readonly<BookingDetails>,
  ) { }

  public isViewable(): boolean {
    return (this.isConfirmed() || this.isCancellationInProgress() || this.isChangeInProgress()) && !this.isInThePast();
  }

  public isConfirmed(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.Confirmed;
  }

  public isChangeInProgress(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.ChangeInProgress;
  }

  public isCancellationInProgress(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.CancellationInProgress
    && this.details.payment?.paymentStatus !== CRMPaymentStatus.Refunded
    && this.details.financeTransaction?.transactionStatus !== CRMFinanceTransactionStatus.Recognised;
  }

  public isInThePast(): boolean {
    const now = dayjs();
    return dayjs(this.details.testDate).isBefore(now);
  }

  public testIsToday(): boolean {
    const today = dayjs();
    return today.isSame(this.details.testDate, 'day');
  }

  public canBeCancelled(): boolean {
    return !this.testIsToday() && !this.isInThePast();
  }

  public isRefundable(): boolean {
    return !this.testIsWithin3WorkingDays();
  }

  public canBeRescheduled(): boolean {
    return !this.testIsWithin3WorkingDays();
  }

  public get lastRefundOrRescheduleDate(): string | undefined {
    if (this.testIsToday()) {
      return undefined;
    }
    return this.details.testDateMinus3ClearWorkingDays;
  }

  private testIsWithin3WorkingDays(): boolean {
    if (this.testIsToday()) {
      return true;
    }
    if (!this.details.testDateMinus3ClearWorkingDays) {
      throw new Error('Cannot calculate as 3 working days value is missing');
    }
    const today = dayjs();
    return today.isAfter(this.details.testDateMinus3ClearWorkingDays, 'day');
  }
}

// Sort compare function
export const byTestDateSoonestFirst = (b1: Booking, b2: Booking): 1 | -1 => {
  if (b1.details.testDate > b2.details.testDate) {
    return 1;
  }
  return -1;
};
