import { Request } from 'express';
import { BookingResponse, LicenceResponse } from '../../services/crm-gateway/interfaces';
import { CRMAdditionalSupport } from '../../services/crm-gateway/enums';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { Scheduler } from '../../services/scheduling/scheduling-service';
import { toTestEngineTestType } from '../../services/crm-gateway/maps';
import logger from '../../helpers/logger';
import { Booking, Candidate, store } from '../../services/session';
import { buildPaymentReference, buildPersonReference } from '../../services/payments/payment-helper';

export class BookingHandler {
  private candidate: Candidate;

  private readonly booking: Booking;

  constructor(
    private readonly scheduling: Scheduler,
    private readonly crmGateway: CRMGateway,
    private readonly req: Request,
  ) {
    this.candidate = store.candidate.get(req);
    this.booking = store.currentBooking.get(req);
  }

  public async createBooking(): Promise<void> {
    await this.reserveBooking();
    await this.createEntities();
  }

  private async reserveBooking(): Promise<void> {
    const { reservationId } = await this.scheduling.reserveSlot(this.booking.centre, this.booking.testType, this.booking.dateTime);
    store.currentBooking.update(this.req, {
      reservationId,
    });

    logger.info(`BOOKING-APP::BOOKING-HANDLER: Reservation was made: ${reservationId}`);
  }

  private async createEntities(): Promise<void> {
    let bookingResponse: BookingResponse;
    let licence: LicenceResponse | undefined;

    const getCandidateAndProductResponse = await this.crmGateway.getLicenceAndProduct(this.candidate.licenceNumber, toTestEngineTestType(this.booking.testType));
    const { product } = getCandidateAndProductResponse;
    licence = getCandidateAndProductResponse.licence;

    if (licence && licence.candidateId && licence.licenceId) {
      const candidate = await this.crmGateway.getCandidateByLicenceNumber(this.candidate.licenceNumber);
      this.updateCandidateDetailsInStore(licence, candidate);
      bookingResponse = await this.crmGateway.createBooking(this.candidate, this.booking, this.getAdditionalSupport());
    } else {
      this.candidate.personReference = buildPersonReference();
      const createCandidateAndBookingResponse = await this.crmGateway.createCandidateAndBooking(this.candidate, this.booking, this.getAdditionalSupport());
      licence = createCandidateAndBookingResponse.licence;
      bookingResponse = createCandidateAndBookingResponse.booking;
      this.updateCandidateDetailsInStore(licence, this.candidate);
    }

    const salesReference = buildPaymentReference(27);
    this.booking.salesReference = salesReference;

    const bookingProductId = await this.crmGateway.createBookingProduct(this.candidate, this.booking, product, bookingResponse);

    store.currentBooking.update(this.req, {
      bookingRef: bookingResponse.reference,
      bookingId: bookingResponse.id,
      bookingProductId,
      salesReference,
    });
  }

  private updateCandidateDetailsInStore(licence: LicenceResponse, candidate?: Candidate): void {
    store.candidate.update(this.req, {
      candidateId: licence.candidateId,
      licenceId: licence.licenceId,
      personReference: candidate?.personReference || buildPersonReference(),
    });

    this.candidate = store.candidate.get(this.req);
  }

  private getAdditionalSupport(): CRMAdditionalSupport {
    if (store.currentBooking.get(this.req).bsl) {
      return CRMAdditionalSupport.BritishSignLanguage;
    }
    return CRMAdditionalSupport.None;
  }
}
