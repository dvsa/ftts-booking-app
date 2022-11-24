import { Booking } from '../session';

export const hasSlotsKpis = (booking: Booking): boolean => (
  booking.dateAvailableOnOrAfterPreferredDate !== undefined
  && booking.dateAvailableOnOrAfterToday !== undefined
  && booking.dateAvailableOnOrBeforePreferredDate !== undefined
);
