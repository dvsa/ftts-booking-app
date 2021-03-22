import { Request } from 'express';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { BookingDetails } from '../../services/crm-gateway/interfaces';
import { Candidate, store } from '../../services/session';

export type ManageCandidateBookings = {
  candidate?: Candidate;
  bookings?: BookingDetails[];
};

export class BookingManager {
  private static instance: BookingManager;

  constructor(
    private crm: CRMGateway,
  ) { }

  public static getInstance(crm: CRMGateway): BookingManager {
    if (!BookingManager.instance) {
      BookingManager.instance = new BookingManager(crm);
    }

    return BookingManager.instance;
  }

  public async loadCandidateBookings(req: Request, licenceNumber: string): Promise<ManageCandidateBookings> {
    const candidate = await this.crm.getCandidateByLicenceNumber(licenceNumber);
    if (!candidate) {
      return Promise.resolve({ candidate });
    }

    const { candidateId } = candidate;
    const bookings = await this.crm.getCandidateBookings(candidateId);

    store.manageBooking.update(req, {
      candidate,
      bookings,
    });

    return Promise.resolve({ candidate, bookings });
  }
}
