import { Request } from 'express';
import { CRMAdditionalSupport } from '../services/crm-gateway/enums';
import { CRMGateway } from '../services/crm-gateway/crm-gateway';
import { SchedulingGateway } from '../services/scheduling/scheduling-gateway';
import { BusinessTelemetryEvents, logger } from './logger';
import { Booking, Candidate } from '../services/session';
import { buildPaymentReference } from '../services/payments/payment-helper';
import { Target, Voiceover } from '../domain/enums';
import config from '../config';

export class BookingHandler {
  private candidate: Candidate;

  private readonly isStandardAccommodation: boolean;

  private readonly booking: Booking;

  constructor(
    private readonly crmGateway: CRMGateway,
    private readonly req: Request,
    private readonly scheduling?: SchedulingGateway,
  ) {
    if (!req.session.candidate) {
      throw Error('BookingHandler::constructor: No candidate set');
    }
    if (!req.session.currentBooking) {
      throw Error('BookingHandler::constructor: No currentBooking set');
    }
    if (!req.session.journey || req.session.journey.standardAccommodation === undefined) {
      throw Error('BookingHandler::constructor: No journey set');
    }
    this.candidate = req.session.candidate;
    this.booking = req.session.currentBooking;
    this.isStandardAccommodation = req.session.journey?.standardAccommodation;
  }

  public async createBooking(): Promise<void> {
    await this.reserveBooking();
    await this.createEntities();
  }

  private async reserveBooking(): Promise<void> {
    if (this.isStandardAccommodation && this.scheduling) {
      if (!this.booking.centre || !this.booking.testType || !this.booking.dateTime) {
        throw Error('BookingHandler::reserveBooking: No booking params set');
      }
      const { reservationId } = await this.scheduling.reserveSlot(this.booking.centre, this.booking.testType, this.booking.dateTime);
      this.req.session.currentBooking = {
        ...this.req.session.currentBooking,
        reservationId,
      };

      logger.event(BusinessTelemetryEvents.SCHEDULING_RESERVATION_SUCCESS, 'BookingHandler::reserveBooking: Successfully reserved a slot for the booking', {
        reservationId,
        candidateId: this.candidate.candidateId,
        licenceId: this.candidate.licenceId,
        testCentre: this.booking.centre,
        dateTime: this.booking.dateTime,
        testType: this.booking.testType,
      });

      logger.info('BookingHandler::reserveBooking: Reservation was made', {
        reservationId,
        bookingId: this.booking.bookingId,
      });
    }
  }

  private async createEntities(): Promise<void> {
    logger.debug('BookingHandler::createEntities: Attempting to create entities', { bookingId: this.booking.bookingId });
    if (!this.candidate.licenceNumber || !this.booking.testType) {
      throw Error('BookingHandler::createEntities: No booking params set');
    }

    const priceListId = this.req.session.target === Target.NI ? config.crm.priceListId.dva : config.crm.priceListId.dvsa;
    const candidateAndBookingResponse = await this.crmGateway.updateCandidateAndCreateBooking(this.candidate, this.booking, this.getAdditionalSupport(), this.isStandardAccommodation, priceListId);

    if (this.isStandardAccommodation) {
      this.booking.salesReference = buildPaymentReference(27);
    }

    const bookingProductId = await this.crmGateway.createBookingProduct(this.candidate, this.booking, candidateAndBookingResponse.booking, this.isStandardAccommodation, this.getAdditionalSupport());

    this.req.session.currentBooking = {
      ...this.req.session.currentBooking,
      bookingRef: candidateAndBookingResponse.booking.reference,
      bookingProductRef: `${candidateAndBookingResponse.booking.reference}-01`,
      bookingId: candidateAndBookingResponse.booking.id,
      bookingProductId,
      salesReference: this.booking.salesReference,
    };
  }

  private getAdditionalSupport(): CRMAdditionalSupport {
    const { currentBooking } = this.req.session;

    if (currentBooking?.bsl) {
      return CRMAdditionalSupport.BritishSignLanguage;
    }
    if (currentBooking?.voiceover && currentBooking?.voiceover === Voiceover.WELSH) {
      return CRMAdditionalSupport.VoiceoverWelsh;
    }
    if (currentBooking?.voiceover && currentBooking?.voiceover === Voiceover.ENGLISH) {
      return CRMAdditionalSupport.VoiceoverEnglish;
    }

    return CRMAdditionalSupport.None;
  }
}
