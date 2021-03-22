import { Request, Response } from 'express';
import { translate } from '../../helpers/language';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { Scheduler, SlotUnavailableError } from '../../services/scheduling/scheduling-service';
import { TestLanguage } from '../../domain/test-language';
import {
  LANGUAGE, LOCALE, TARGET, Voiceover,
} from '../../domain/enums';
import logger from '../../helpers/logger';
import { buildBookingRescheduledEmailContent } from '../../services/notifications/content/builders';
import { NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { BookingRescheduledDetails } from '../../services/notifications/types';
import { Booking as SessionBooking, Candidate, store } from '../../services/session';
import { ChangeErrorViewData } from '../../views/manage-booking/change-error-types';
import { CollapsedCentreLocationView } from '../../views/macros/collapsed-centre-location-types';
import {
  CRMAdditionalSupport, CRMBookingStatus, CRMTestLanguage, CRMVoiceOver,
} from '../../services/crm-gateway/enums';
import { BookingManager } from './booking-manager';
import { Centre } from '../../domain/types';
import { mapBookingEntityToSessionBooking } from '../../helpers/session-helper';
import { Booking } from '../../domain/booking/booking';
import { TestVoiceover } from '../../domain/test-voiceover';
import { mapVoiceoverToCRMVoiceover } from '../../services/crm-gateway/crm-helper';

export type CheckChangeViewData = {
  booking: {
    language?: string;
    testDate?: string;
    testCentre?: CollapsedCentreLocationView;
    voiceover?: string;
    bsl?: string;
  };
};

export type ConfirmChangeViewData = {
  booking: {
    reference: string;
    language: string;
    testDate: string;
    testType: string;
    bsl: string;
    voiceover: string;
    testCentre: CollapsedCentreLocationView;
  };
  voiceoverRequested: boolean;
  latestRefundDate?: string;
};

export class ManageBookingCheckChangeController {
  constructor(
    private crm: CRMGateway,
    private scheduling: Scheduler,
    private notificationsGateway: NotificationsGateway,
    private bookingManager: BookingManager,
  ) { }

  public get = (req: Request, res: Response): void => {
    const { candidate, bookings } = store.manageBooking.get(req);

    const booking = store.currentBooking.get(req);
    if (!candidate?.candidateId || !booking || !bookings || !bookings.length) {
      return res.redirect('/manage-booking/login');
    }
    const {
      centre, dateTime, language, bsl, voiceover,
    } = store.manageBookingEdits.get(req);

    const viewData: CheckChangeViewData = {
      booking: {},
    };

    if (centre || dateTime) {
      viewData.booking.testCentre = {
        name: centre?.name || booking.centre.name,
        addressLine1: centre?.addressLine1 || booking.centre.addressLine1,
        addressLine2: centre?.addressLine2 || booking.centre.addressLine2,
        addressCounty: centre?.addressCounty || booking.centre.addressCounty,
        addressCity: centre?.addressCity || booking.centre.addressCity,
        addressPostalCode: centre?.addressPostalCode || booking.centre.addressPostalCode,
      };
      viewData.booking.testDate = dateTime || booking.dateTime;
    }

    if (language) {
      const languageObj = new TestLanguage(language);
      viewData.booking.language = languageObj.toString();
    }

    if (voiceover) {
      viewData.booking.voiceover = this.isVoiceoverRequested(voiceover) ? this.getVoiceoverText(req, voiceover) : translate('generalContent.no');
    }

    if (bsl !== undefined) {
      viewData.booking.bsl = bsl ? translate('generalContent.yes') : translate('generalContent.no');
    }

    return res.render('manage-booking/check-change', {
      ...viewData,
    });
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    let currentBooking = store.currentBooking.get(req);
    const {
      bookingRef,
      bookingId,
      bookingProductId,
      voiceover,
    } = currentBooking;
    const { candidate } = store.manageBooking.get(req);
    const target = store.target.get(req);
    const lang = store.locale.get(req);

    let voiceoverRequested = this.isVoiceoverRequested(voiceover);
    const bookingEdits = store.manageBookingEdits.get(req);

    if (bookingEdits.dateTime) {
      const { dateTime } = bookingEdits;
      const { testType } = currentBooking;
      const centre = bookingEdits.centre || currentBooking.centre;

      let reservationId;
      try {
        logger.info(`Attempting to reserve a new slot in the scheduling api: ${bookingRef}`);
        // Todo: reservationId will be used when we add the confirmBooking call
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ reservationId } = await this.scheduling.reserveSlot(centre, testType, dateTime));
        await this.setChangeInProgressInCRM(bookingRef, bookingId);
        await this.scheduling.deleteBooking(bookingRef, currentBooking.centre.region);
        try {
          // TODO - FTT-4476 - Need to get behavioural markers.
          await this.scheduling.confirmBooking(
            [{
              bookingReferenceId: bookingRef,
              reservationId,
              notes: '',
              behaviouralMarkers: '',
            }],
            centre.region,
          );
        } catch (e) {
          const errorViewData: ChangeErrorViewData = {
            bookingRef,
            slotUnavailable: false,
            canRetry: false,
          };
          store.reset(req);
          return res.render('manage-booking/change-error', errorViewData);
        }

        try {
          await this.updateTimeAndLocationInCrm(bookingRef, bookingId, dateTime, centre);
          await this.updateTCNUpdateDate(bookingRef, bookingProductId);
          await this.reloadBookings(req, bookingRef, candidate);
        } catch (e) {
          logger.info('Non-fatal, allowing user to continue to Booking Change Success page.');
        }
      } catch (e) {
        const errorViewData: ChangeErrorViewData = {
          bookingRef,
          slotUnavailable: e instanceof SlotUnavailableError,
          canRetry: true,
        };
        return res.render('manage-booking/change-error', errorViewData);
      }
    }

    if (bookingEdits.voiceover) {
      try {
        voiceoverRequested = this.isVoiceoverRequested(bookingEdits.voiceover);
        const crmVoiceover = mapVoiceoverToCRMVoiceover(bookingEdits.voiceover);
        await this.updateVoiceoverInCrm(bookingRef, bookingId, bookingProductId, crmVoiceover);
        await this.reloadBookings(req, bookingRef, candidate);
      } catch (e) {
        const errorViewData: ChangeErrorViewData = {
          bookingRef,
          slotUnavailable: false,
          canRetry: true,
        };
        return res.render('manage-booking/change-error', errorViewData);
      }
    }

    if (bookingEdits.language) {
      try {
        await this.updateLanguage(bookingRef, bookingId, bookingProductId, bookingEdits.language === LANGUAGE.WELSH ? CRMTestLanguage.Welsh : CRMTestLanguage.English);
        await this.bookingManager.loadCandidateBookings(req, candidate.licenceNumber);
      } catch (e) {
        const errorViewData: ChangeErrorViewData = {
          bookingRef,
          slotUnavailable: false,
          canRetry: true,
        };
        return res.render('manage-booking/change-error', errorViewData);
      }
    }

    if (bookingEdits.bsl !== undefined) { // If we are looking to change the BSL within our manage booking journey.
      const { bsl } = bookingEdits;

      const updatedBsl = bsl ? CRMAdditionalSupport.BritishSignLanguage : CRMAdditionalSupport.None;

      try {
        await this.updateAdditionalSupportInCrm(bookingRef, bookingId, bookingProductId, updatedBsl);
        await this.reloadBookings(req, bookingRef, candidate);
      } catch (e) {
        const errorViewData: ChangeErrorViewData = {
          bookingRef,
          slotUnavailable: false,
          canRetry: true,
        };
        return res.render('manage-booking/change-error', errorViewData);
      }
    }

    currentBooking = store.currentBooking.get(req);
    const changedBooking: SessionBooking = {
      ...currentBooking,
      centre: bookingEdits.centre || currentBooking.centre,
      dateTime: bookingEdits.dateTime || currentBooking.dateTime,
      bsl: bookingEdits.bsl ?? currentBooking.bsl,
      language: bookingEdits.language ?? currentBooking.language,
    };

    if (currentBooking) {
      await this.sendRescheduledEmail(changedBooking, candidate, target, lang);
    }

    const confirmChangeViewData: ConfirmChangeViewData = {
      booking: {
        reference: currentBooking.bookingRef,
        language: new TestLanguage(bookingEdits.language || currentBooking.language).toString(),
        testType: currentBooking.testType,
        bsl: (bookingEdits.bsl ?? currentBooking.bsl) ? translate('generalContent.yes') : translate('generalContent.no'),
        // eslint-disable-next-line no-nested-ternary
        voiceover: voiceoverRequested ? (bookingEdits.voiceover ? this.getVoiceoverText(req, bookingEdits.voiceover) : this.getVoiceoverText(req, currentBooking.voiceover)) : '',
        testCentre: {
          name: bookingEdits?.centre?.name || currentBooking.centre.name,
          addressLine1: bookingEdits?.centre?.addressLine1 || currentBooking.centre.addressLine1,
          addressLine2: bookingEdits?.centre?.addressLine2 || currentBooking.centre.addressLine2,
          addressCity: bookingEdits?.centre?.addressCity || currentBooking.centre.addressCity,
          addressCounty: bookingEdits?.centre?.addressCounty || currentBooking.centre.addressCounty,
          addressPostalCode: bookingEdits?.centre?.addressPostalCode || currentBooking.centre.addressPostalCode,
        },
        testDate: bookingEdits?.dateTime || currentBooking.dateTime,
      },
      latestRefundDate: currentBooking.lastRefundDate,
      voiceoverRequested,
    };

    this.resetBookingSession(req);

    return res.render('manage-booking/change-confirmation', {
      ...confirmChangeViewData,
    });
  };

  private getVoiceoverText = (req: Request, voiceover: Voiceover): string => (req?.res?.locals?.target as TARGET === TARGET.NI
    ? TestVoiceover.fromDVAVoiceoverOption(voiceover)
    : TestVoiceover.fromDVSAVoiceoverOption(voiceover)
  );

  private isVoiceoverRequested = (voiceover: Voiceover): boolean => voiceover !== Voiceover.NONE;

  private sendRescheduledEmail = async (booking: SessionBooking, candidate: Candidate, target: TARGET, lang: LOCALE): Promise<void> => {
    try {
      const { email } = candidate;
      logger.info('Sending rescheduling email');
      const bookingRescheduleDetails: BookingRescheduledDetails = {
        bookingRef: booking.bookingRef,
        testType: booking.testType,
        testDateTime: booking.dateTime,
        testCentre: booking.centre,
        lastRefundDate: booking.lastRefundDate,
      };
      const emailContent = buildBookingRescheduledEmailContent(bookingRescheduleDetails, target, lang);
      await this.notificationsGateway.sendEmail(email, emailContent, booking.bookingRef, target);
    } catch (error) {
      logger.error(error, `Could not send booking reschedule email - candidateId: ${candidate.candidateId}`);
    }
  };

  public async reloadBookings(req: Request, bookingRef: string, candidate: Candidate): Promise<void> {
    await this.bookingManager.loadCandidateBookings(req, candidate.licenceNumber);
    let booking = store.manageBooking.getBooking(req, bookingRef);
    if (booking) {
      booking = await this.calculateThreeWorkingDays(req, booking);
      store.currentBooking.update(req, mapBookingEntityToSessionBooking(booking));
    }
  }

  private async calculateThreeWorkingDays(req: Request, booking: Booking): Promise<Booking> {
    if (booking && !booking.testIsToday()) {
      const { testDate, testCentre: { remit } } = booking.details;
      const result = await this.crm.calculateThreeWorkingDays(testDate, remit);
      return store.manageBooking.updateBooking(req, booking.details.reference, {
        testDateMinus3ClearWorkingDays: result,
      });
    }

    return booking;
  }

  public reset = (req: Request, res: Response): void => {
    const bookingReference = store.currentBooking.get(req).bookingRef;

    this.resetBookingSession(req);

    return res.redirect(`/manage-booking/${bookingReference}`);
  };

  private resetBookingSession(req: Request): void {
    store.manageBookingEdits.reset(req);
    store.currentBooking.reset(req);
    store.journey.update(req, { inManagedBookingEditMode: false });
    store.testCentreSearch.reset(req);
  }

  private setChangeInProgressInCRM = async (bookingRef: string, bookingId: string): Promise<void> => {
    try {
      logger.info(`Attempting to set booking status to Change in Progress - booking ref: ${bookingRef}`);
      return await this.crm.updateBookingStatus(bookingId, CRMBookingStatus.ChangeInProgress);
    } catch (error) {
      logger.error(error, `Failed to set status of Change in Progress in CRM after 3 retries - booking ref: ${bookingRef}`);
      throw error;
    }
  };

  private updateTimeAndLocationInCrm = async (bookingRef: string, bookingId: string, dateTime: string, centre: Centre): Promise<void> => {
    try {
      logger.info(`Attempting to store updated booking location and/or time and date - booking ref: ${bookingRef}`);
      return await this.crm.rescheduleBookingAndConfirm(bookingId, dateTime, centre.accountId);
    } catch (error) {
      logger.error(error, `Failed to store updated booking location and/or time and date in CRM after max retries - booking ref: ${bookingRef}, date and time: ${dateTime}, centre id: ${centre.siteId}, centre name: ${centre.name}`);
      throw error;
    }
  };

  private updateAdditionalSupportInCrm = async (bookingRef: string, bookingId: string, bookingProductId: string, additionalSupport: CRMAdditionalSupport): Promise<void> => {
    try {
      logger.info(`Attempting to store updated additional support options - booking ref: ${bookingRef}`);
      return await this.crm.updateAdditionalSupport(bookingId, bookingProductId, additionalSupport);
    } catch (error) {
      logger.error(error, `Failed to store updated additional support options for booking in CRM after max retries - booking ref: ${bookingRef}`);
      throw error;
    }
  };

  private updateVoiceoverInCrm = async (bookingRef: string, bookingId: string, bookingProductId: string, voiceover: CRMVoiceOver): Promise<void> => {
    try {
      logger.info(`Attempting to store updated voiceover - booking ref: ${bookingRef}`);
      return await this.crm.updateVoiceover(bookingId, bookingProductId, voiceover);
    } catch (error) {
      logger.error(error, `Failed to store updated voiceover for booking in CRM after max retries - booking ref: ${bookingRef}`);
      throw error;
    }
  };

  private updateTCNUpdateDate = async (bookingRef: string, bookingProductId: string): Promise<void> => {
    try {
      logger.info(`Attempting to update TCN update date in CRM - booking ref: ${bookingRef}`);
      return await this.crm.updateTCNUpdateDate(bookingProductId);
    } catch (error) {
      logger.error(error, `Failed to update TCN update date in CRM after max retries - booking ref: ${bookingRef}`);
      throw error;
    }
  };

  private updateLanguage = async (bookingRef: string, bookingId: string, bookingProductId: string, language: CRMTestLanguage): Promise<void> => {
    try {
      logger.info(`Attempting to store updated booking language - booking ref: ${bookingRef}`);
      return this.crm.updateLanguage(bookingId, bookingProductId, language);
    } catch (error) {
      logger.error(error, `Failed to store updated booking language in CRM after max retries - booking ref: ${bookingRef}`);
      throw error;
    }
  };
}

export default new ManageBookingCheckChangeController(
  CRMGateway.getInstance(),
  Scheduler.getInstance(),
  NotificationsGateway.getInstance(),
  BookingManager.getInstance(CRMGateway.getInstance()),
);
