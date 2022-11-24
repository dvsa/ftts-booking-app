import { Booking, Candidate } from '../services/session';

export const isValidSessionBooking = (obj: Booking | undefined): obj is Booking & Required<Pick<Booking, 'bookingId' | 'bookingProductId' | 'reservationId' | 'bookingRef' | 'bookingProductRef' | 'dateTime' | 'centre' | 'testType'>> => Boolean(
  obj
  && obj.bookingId
  && obj.bookingProductId
  && obj.reservationId
  && obj.bookingRef
  && obj.bookingProductRef
  && obj.dateTime
  && obj.centre
  && obj.testType,
);

export const isValidSessionCandidate = (obj: Candidate | undefined): obj is Candidate & Required<Pick<Candidate, 'candidateId' | 'email'>> => Boolean(
  obj
  && obj.candidateId
  && obj.email,
);
