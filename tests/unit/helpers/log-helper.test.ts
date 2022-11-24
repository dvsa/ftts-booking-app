import { Request } from 'express';
import { getCreatedBookingIdentifiers } from '../../../src/helpers/log-helper';

describe('log helper', () => {
  let req: Request;

  beforeEach(() => {
    req = {
      session: {
        candidate: {
          candidateId: 'candidate-id',
          licenceId: 'licence-id',
        },
        currentBooking: {
          bookingId: 'fd73b747-dfa0-46e7-be4b-1a79aa8e25da',
          bookingRef: 'B-000-000-001',
          bookingProductId: '60012278-8783-ea11-a811-00224801cecd',
          bookingProductRef: 'B-000-000-001-01',
        },
      },
    } as any as Request;
  });

  test('return created booking identifiers', () => {
    const identifiers = getCreatedBookingIdentifiers(req);

    expect(identifiers).toStrictEqual({
      bookingId: 'fd73b747-dfa0-46e7-be4b-1a79aa8e25da',
      bookingRef: 'B-000-000-001',
      bookingProductId: '60012278-8783-ea11-a811-00224801cecd',
      bookingProductRef: 'B-000-000-001-01',
      candidateId: 'candidate-id',
      licenceId: 'licence-id',
    });
  });

  test('missing data in booking identifiers does not error', () => {
    const identifiers = getCreatedBookingIdentifiers(undefined as any as Request);

    expect(identifiers).toStrictEqual({});
  });
});
