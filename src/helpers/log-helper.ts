import { Request } from 'express';

type CreatedBookingIdentifiers = {
  bookingId?: string,
  bookingRef?: string,
  bookingProductId?: string,
  bookingProductRef?: string,
  candidateId?: string,
  licenceId?: string,
};

const getCreatedBookingIdentifiers = (req: Request): CreatedBookingIdentifiers => {
  if (!req?.session) {
    return {};
  }

  const { currentBooking: booking, candidate } = req.session;
  return {
    bookingId: booking?.bookingId,
    bookingRef: booking?.bookingRef,
    bookingProductId: booking?.bookingProductId,
    bookingProductRef: booking?.bookingProductRef,
    candidateId: candidate?.candidateId,
    licenceId: candidate?.licenceId,
  };
};

export {
  getCreatedBookingIdentifiers,
};
