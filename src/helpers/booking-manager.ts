import { Request } from 'express';
import { Target } from '../domain/enums';
import { CRMGateway } from '../services/crm-gateway/crm-gateway';
import { CRMGovernmentAgency } from '../services/crm-gateway/enums';
import { BookingDetails } from '../services/crm-gateway/interfaces';
import { Candidate } from '../services/session';

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

  public async loadCandidateBookings(req: Request, candidateId: string): Promise<BookingDetails[]> {
    const allBookings = await this.crm.getCandidateBookings(candidateId);
    const target = req.session.target ?? Target.GB;
    const bookings = allBookings.filter((booking: BookingDetails) => this.agencyMatchesTarget(booking.governmentAgency, target));

    req.session.manageBooking = {
      ...req.session.manageBooking,
      bookings,
    };

    return bookings;
  }

  private agencyMatchesTarget = (agency: CRMGovernmentAgency, target: Target): boolean => (agency in CRMGovernmentAgency)
    && ((agency === CRMGovernmentAgency.Dva && target === Target.NI)
      || (agency === CRMGovernmentAgency.Dvsa && target === Target.GB));
}
