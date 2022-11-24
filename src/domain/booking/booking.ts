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
    return ((this.isConfirmed() || this.isCancellationInProgress() || this.isChangeInProgress() || (this.isNSABooking() && this.isDraft())) && !this.isInThePast()) || this.isCompensationTestEligible();
  }

  public isCompensationTestEligible(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.Cancelled && this.details.owedCompensationBooking;
  }

  public isZeroCost(): boolean {
    return Boolean(this.details.isZeroCostBooking);
  }

  public isConfirmed(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.Confirmed;
  }

  public isChangeInProgress(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.ChangeInProgress;
  }

  public isDraft(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.Draft;
  }

  public isCancellationInProgress(): boolean {
    return this.details.bookingStatus === CRMBookingStatus.CancellationInProgress
    && this.details.paymentStatus !== CRMPaymentStatus.Refunded
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

  public isCreatedToday(): boolean {
    const today = dayjs();
    return today.isSame(this.details.createdOn, 'day');
  }

  public canBeCancelled(): boolean {
    return !this.isCreatedToday() && !this.testIsToday() && !this.isInThePast() && !this.isNSABooking();
  }

  public isRefundable(): boolean {
    return !this.testIsWithin3WorkingDays();
  }

  public canBeRescheduled(): boolean {
    return !this.testIsWithin3WorkingDays() && !this.hasEligibilityBypass() && !this.isNSABooking();
  }

  public canBeChanged(): boolean {
    return !this.testIsWithin3WorkingDays() && !this.isNSABooking();
  }

  public get lastRefundOrRescheduleDate(): string | undefined {
    if (this.testIsToday()) {
      return undefined;
    }
    return this.details.testDateMinus3ClearWorkingDays;
  }

  private isNSABooking(): boolean {
    if (this.details.nonStandardAccommodation === null || this.details.nonStandardAccommodation === undefined) {
      throw new Error('BookingController::testIsAnNsaBooking: Non standard accommodation flag is missing');
    }
    return this.details.nonStandardAccommodation;
  }

  private testIsWithin3WorkingDays(): boolean {
    if (this.testIsToday()) {
      return true;
    }
    if (!this.details.testDateMinus3ClearWorkingDays) {
      throw new Error('BookingController::testIsWithin3WorkingDays: Cannot calculate as 3 working days value is missing');
    }
    const today = dayjs();
    return today.isAfter(this.details.testDateMinus3ClearWorkingDays, 'day');
  }

  private hasEligibilityBypass(): boolean {
    if (this.details.enableEligibilityBypass == null) {
      return false;
    }

    return this.details.enableEligibilityBypass;
  }
}

// Sort compare function
export const byTestDateSoonestFirst = (b1: Booking, b2: Booking): 1 | -1 => (String(b1.details.testDate) > String(b2.details.testDate) ? 1 : -1);
