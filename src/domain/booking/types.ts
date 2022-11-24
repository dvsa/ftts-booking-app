export interface BookingRequest {
  bookingReferenceId: string;
  reservationId: string;
  notes: string;
  behaviouralMarkers: string | null;
}

export interface BookingResponse {
  reservationId: string;
  status: string;
  message: string;
}

export interface BookingFullResponse {
  bookingReferenceId: string;
  reservationId: string;
  testCentreId: string;
  startDateTime: string;
  testTypes: string[];
  notes: string;
  behaviouralMarkers: string;
}

export interface ReservationResponse {
  testCentreId: string;
  testTypes: string[];
  startDateTime: string;
  reservationId: string;
}
