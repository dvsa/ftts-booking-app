import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { translate } from '../../helpers/language';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { SchedulingGateway, SlotUnavailableError } from '../../services/scheduling/scheduling-gateway';
import { TestLanguage } from '../../domain/test-language';
import {
  Language, Locale, Target, TestType, Voiceover, Origin,
} from '../../domain/enums';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { buildBookingRescheduledEmailContent } from '../../services/notifications/content/builders';
import { notificationsGateway, NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { BookingRescheduledDetails } from '../../services/notifications/types';
import {
  Booking as SessionBooking, Candidate, ManageBookingEdits, store,
} from '../../services/session';
import {
  CRMAdditionalSupport, CRMBookingStatus, CRMTestLanguage, CRMVoiceOver,
} from '../../services/crm-gateway/enums';
import { BookingManager } from '../../helpers/booking-manager';
import { Centre } from '../../domain/types';
import { mapBookingEntityToSessionBooking } from '../../helpers/session-helper';
import { Booking } from '../../domain/booking/booking';
import { mapVoiceoverToCRMVoiceover } from '../../services/crm-gateway/crm-helper';
import { BookingDetails } from '../../services/crm-gateway/interfaces';
import { behaviouralMarkerLabel, hasBehaviouralMarkerForTest } from '../../domain/eligibility';
import { bslIsAvailable } from '../../domain/bsl';
import { TestVoiceover } from '../../domain/test-voiceover';
import { KPIIdentifiers } from '../../services/scheduling/types';

export type CollapsedCentreLocationView = {
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCounty?: string;
  addressCity: string;
  addressPostalCode: string;
};

export type CheckChangeViewData = {
  booking: {
    language?: string;
    testDate?: string;
    testCentre?: CollapsedCentreLocationView;
    voiceover?: string;
    bsl?: string;
  };
};

export type ChangeErrorViewData = {
  bookingRef: string;
  slotUnavailable?: boolean;
  canRetry: boolean;
};

export type ConfirmChangeViewData = {
  booking: {
    reference: string;
    language: string;
    testDate: string;
    testType: TestType;
    bsl: string;
    voiceover: string;
    testCentre: CollapsedCentreLocationView;
  };
  voiceoverRequested: boolean;
  latestRefundDate?: string;
  bslAvailable: boolean;
  voiceoverAvailable: boolean;
};

export class ManageBookingCheckChangeController {
  constructor(
    private crm: CRMGateway,
    private scheduling: SchedulingGateway,
    private notifications: NotificationsGateway,
    private bookingManager: BookingManager,
  ) { }

  public get = (req: Request, res: Response): void => {
    if (!req.session.manageBooking) {
      throw Error('ManageBookingCheckChangeController::get: No manageBooking set');
    }
    if (!req.session.manageBookingEdits) {
      throw Error('ManageBookingCheckChangeController::get: No manageBookingEdits set');
    }
    const { candidate, bookings } = req.session.manageBooking;

    const booking = req.session.currentBooking;
    if (!candidate?.candidateId || !booking || !bookings || !bookings.length || !candidate.eligibleToBookOnline) {
      return res.redirect('/manage-booking/login');
    }

    return this.renderCheckChange(req, res, candidate, booking, bookings, req.session.manageBookingEdits);
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.currentBooking) {
      throw Error('ManageBookingCheckChangeController::post: No currentBooking set');
    }
    if (!req.session.manageBooking) {
      throw Error('ManageBookingCheckChangeController::post: No manageBooking set');
    }
    const { currentBooking } = req.session;
    const {
      bookingRef,
      bookingProductRef,
      bookingId,
      bookingProductId,
      voiceover,
    } = currentBooking;
    const { candidate } = req.session.manageBooking;

    logger.debug('ManageBookingCheckChangeController::post: Current booking data', {
      currentBooking,
    });

    if (!bookingRef || !bookingProductRef || !bookingId || !bookingProductId || !voiceover || !candidate?.licenceNumber || !candidate?.candidateId) {
      logger.warn('ManageBookingCheckChangeController::post: Missing required session data', {
        bookingRef: !bookingRef,
        bookingProductRef: !bookingProductRef,
        bookingId: !bookingId,
        bookingProductId: !bookingProductId,
        voiceover: !voiceover,
        licenceNumber: !candidate?.licenceNumber,
        candidateId: !candidate?.candidateId,
      });
      throw Error('ManageBookingCheckChangeController::post: Missing required session data');
    }

    const booking = store.manageBooking.getBooking(req, bookingRef);

    if (!candidate.eligibleToBookOnline) {
      logger.warn('ManageBookingCheckChangeController::post: Candidate is not eligible to book/reschedule online', {
        candidateId: candidate.candidateId,
      });
      throw Error(`ManageBookingCheckChangeController::post: Candidate is not eligible to book/reschedule online ${candidate.candidateId}`);
    }

    const bookingEdits = req.session.manageBookingEdits;

    try {
      if (bookingEdits?.dateTime) {
        if (!booking || !booking?.canBeRescheduled()) {
          logger.warn('ManageBookingCheckChangeController::post: Booking cannot be rescheduled', {
            bookingRef,
          });
          throw Error(`ManageBookingCheckChangeController::post: Booking cannot be rescheduled ${bookingRef}`);
        }
        return await this.executeDateChange(req, res, bookingRef, bookingProductRef, bookingId, bookingProductId, candidate, bookingEdits, currentBooking);
      }

      if (bookingEdits?.voiceover) {
        return await this.executeVoiceoverChange(req, res, bookingRef, bookingId, bookingProductId, candidate, bookingEdits, currentBooking);
      }

      if (bookingEdits?.language) {
        return await this.executeLanguageChange(req, res, bookingRef, bookingId, bookingProductId, candidate, bookingEdits, currentBooking);
      }

      if (bookingEdits?.bsl !== undefined) { // If we are looking to change the BSL within our manage booking journey.
        return await this.executeBslChange(req, res, bookingRef, bookingId, bookingProductId, candidate, bookingEdits, currentBooking);
      }
    } catch (error) {
      await this.reloadBookings(req, bookingRef, candidate);
      logger.error(error as Error, 'ManageBookingCheckChangeController::post failed executing booking changes');
      throw error;
    }

    return this.renderPost(req, res, candidate, bookingEdits as ManageBookingEdits);
  };

  private renderCheckChange = (req: Request, res: Response, candidate: Candidate, booking: SessionBooking, bookings: BookingDetails[], manageBookingEdits: ManageBookingEdits): void => {
    const {
      centre, dateTime, language, bsl, voiceover,
    } = manageBookingEdits;

    const viewData: CheckChangeViewData = {
      booking: {},
    };

    // Only date/time has changed
    if (dateTime && !centre) {
      viewData.booking.testCentre = {
        name: booking.centre?.name as string,
        addressLine1: booking.centre?.addressLine1,
        addressLine2: booking.centre?.addressLine2,
        addressCounty: booking.centre?.addressCounty,
        addressCity: booking.centre?.addressCity as string,
        addressPostalCode: booking.centre?.addressPostalCode as string,
      };
      viewData.booking.testDate = dateTime;
    }

    // Centre and date time has changed
    if (centre && dateTime) {
      viewData.booking.testCentre = {
        name: centre?.name,
        addressLine1: centre?.addressLine1,
        addressLine2: centre?.addressLine2,
        addressCounty: centre?.addressCounty,
        addressCity: centre?.addressCity,
        addressPostalCode: centre?.addressPostalCode,
      };
      viewData.booking.testDate = dateTime;
    }

    if (language) {
      const languageObj = new TestLanguage(language);
      viewData.booking.language = languageObj.toString();
    }

    if (voiceover) {
      viewData.booking.voiceover = this.isVoiceoverRequested(voiceover)
        ? translate(`generalContent.language.${voiceover}`)
        : translate('generalContent.no');
    }

    if (bsl !== undefined) {
      viewData.booking.bsl = bsl ? translate('generalContent.yes') : translate('generalContent.no');
    }

    return res.render(PageNames.MANAGE_BOOKING_CHECK_CHANGE, {
      ...viewData,
    });
  };

  private executeDateChange = async (req: Request, res: Response, bookingRef: string, bookingProductRef: string, bookingId: string, bookingProductId: string, candidate: Candidate, bookingEdits: ManageBookingEdits, currentBooking: SessionBooking): Promise<void> => {
    const { dateTime } = bookingEdits;
    const {
      testType, origin, firstSelectedDate, dateAvailableOnOrAfterToday, dateAvailableOnOrBeforePreferredDate, dateAvailableOnOrAfterPreferredDate,
    } = currentBooking;
    const kpiIdentifiers: KPIIdentifiers = { dateAvailableOnOrAfterToday, dateAvailableOnOrBeforePreferredDate, dateAvailableOnOrAfterPreferredDate };
    const centre = bookingEdits?.centre || currentBooking?.centre;
    const { behaviouralMarker, behaviouralMarkerExpiryDate } = candidate;

    if (!dateTime) {
      logger.warn('ManageBookingCheckChangeController::executeDateChange: bookingEdits.dateTime is undefined');
      throw Error('ManageBookingCheckChangeController::executeDateChange: bookingEdits.dateTime is undefined');
    }
    if (!centre) {
      logger.warn('ManageBookingCheckChangeController::executeDateChange: centre is undefined');
      throw Error('ManageBookingCheckChangeController::executeDateChange: centre is undefined');
    }
    if (!testType) {
      logger.warn('ManageBookingCheckChangeController::executeDateChange: testType is undefined');
      throw Error('ManageBookingCheckChangeController::executeDateChange: testType is undefined');
    }
    if (!candidate.candidateId) {
      logger.warn('ManageBookingCheckChangeController::executeDateChange: candidate.candidateId is undefined');
      throw Error('ManageBookingCheckChangeController::executeDateChange: candidate.candidateId is undefined');
    }

    try {
      logger.info(`ManageBookingCheckChangeController::executeDateChange: Attempting to reserve a new slot in the scheduling api: ${bookingProductRef}`);
      const { reservationId } = await this.scheduling.reserveSlot(centre, testType, dateTime);
      await this.setChangeInProgressInCRM(bookingRef, bookingId, origin);

      try {
        await this.scheduling.deleteBooking(bookingProductRef, currentBooking?.centre?.region || '');
      } catch (e) {
        logger.error(e, 'ManageBookingCheckChangeController::executeDateChange: Failed to delete booking');
        if (e.response?.status === 401 || e.response?.status === 403) {
          logger.event(BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE, 'ManageBookingCheckChangeController::executeDateChange: Failed to authenticate to the scheduling api', {
            e,
            bookingProductRef,
          });
        } else if (e.response?.status >= 400 && e.response?.status < 500) {
          logger.event(BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE, 'ManageBookingCheckChangeController::executeDateChange: Failed to get request from Scheduling api', {
            e,
            bookingProductRef,
          });
        } else if (e.response?.status >= 500) {
          logger.event(BusinessTelemetryEvents.SCHEDULING_ERROR, 'ManageBookingCheckChangeController::executeDateChange: Failed to communicate with the scheduling API server', {
            e,
            bookingProductRef,
          });
        }
        logger.event(BusinessTelemetryEvents.SCHEDULING_FAIL_DELETE, 'ManageBookingCheckChangeController::executeDateChange: Failed to cancel the previous booking during rescheduling with the Scheduling API', {
          e,
          bookingProductRef,
        });
        throw e;
      }

      try {
        await this.scheduling.confirmBooking(
          [{
            bookingReferenceId: bookingProductRef,
            reservationId,
            notes: '',
            behaviouralMarkers: hasBehaviouralMarkerForTest(dateTime, behaviouralMarker, behaviouralMarkerExpiryDate) ? behaviouralMarkerLabel : '',
          }],
          centre.region,
        );
      } catch (e) {
        if (e.response?.status === 401 || e.response?.status === 403) {
          logger.event(BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE, 'ManageBookingCheckChangeController::executeDateChange: Failed to authenticate to the scheduling api', {
            e,
            bookingProductRef,
            reservationId,
          });
        } else if (e.response?.status >= 400 && e.response?.status < 500) {
          logger.event(BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE, 'ManageBookingCheckChangeController::executeDateChange: Failed to get request from Scheduling api', {
            e,
            bookingProductRef,
            reservationId,
          });
        } else if (e.response?.status >= 500) {
          logger.event(BusinessTelemetryEvents.SCHEDULING_ERROR, 'ManageBookingCheckChangeController::executeDateChange: Failed to communicate with the scheduling API server', {
            e,
            bookingProductRef,
            reservationId,
          });
        }
        logger.event(BusinessTelemetryEvents.SCHEDULING_FAIL_CONFIRM_CHANGE, 'ManageBookingCheckChangeController::executeDateChange: Failed to confirm booking with the Scheduling API', {
          e,
          bookingProductRef,
          reservationId,
        });
        const errorViewData: ChangeErrorViewData = {
          bookingRef,
          slotUnavailable: false,
          canRetry: false,
        };
        await this.reloadBookings(req, bookingRef, candidate);
        store.reset(req);
        return res.render(PageNames.MANAGE_BOOKING_CHANGE_ERROR, errorViewData);
      }

      try {
        await this.updateTimeAndLocationInCrm(bookingRef, bookingId, dateTime, centre, req, candidate, origin, firstSelectedDate, kpiIdentifiers);
        await this.updateTCNUpdateDate(bookingRef, bookingProductId, req, candidate);
        await this.reloadBookings(req, bookingRef, candidate);
      } catch (e) {
        logger.warn('ManageBookingCheckChangeController::executeDateChange: Non-fatal, allowing user to continue to Booking Change Success page.', { bookingRef });
        logger.error(e, 'ManageBookingCheckChangeController::executeDateChange');
      }
    } catch (e) {
      const errorViewData: ChangeErrorViewData = {
        bookingRef,
        slotUnavailable: e instanceof SlotUnavailableError,
        canRetry: true,
      };
      await this.reloadBookings(req, bookingRef, candidate);
      return res.render(PageNames.MANAGE_BOOKING_CHANGE_ERROR, errorViewData);
    }
    return this.renderPost(req, res, candidate, bookingEdits);
  };

  private executeVoiceoverChange = async (req: Request, res: Response, bookingRef: string, bookingId: string, bookingProductId: string, candidate: Candidate, bookingEdits: ManageBookingEdits, booking: SessionBooking): Promise<void> => {
    try {
      const crmVoiceover = mapVoiceoverToCRMVoiceover(bookingEdits?.voiceover);
      await this.updateVoiceoverInCrm(bookingRef, bookingId, bookingProductId, crmVoiceover, booking.origin);
      await this.reloadBookings(req, bookingRef, candidate);
    } catch (e) {
      const errorViewData: ChangeErrorViewData = {
        bookingRef,
        slotUnavailable: false,
        canRetry: true,
      };
      await this.reloadBookings(req, bookingRef, candidate);
      return res.render(PageNames.MANAGE_BOOKING_CHANGE_ERROR, errorViewData);
    }
    return this.renderPost(req, res, candidate, bookingEdits);
  };

  private executeLanguageChange = async (req: Request, res: Response, bookingRef: string, bookingId: string, bookingProductId: string, candidate: Candidate, bookingEdits: ManageBookingEdits, booking: SessionBooking): Promise<void> => {
    try {
      await this.updateLanguage(bookingRef, bookingId, bookingProductId, bookingEdits?.language === Language.WELSH ? CRMTestLanguage.Welsh : CRMTestLanguage.English, booking.origin);
      await this.bookingManager.loadCandidateBookings(req, candidate.candidateId as string);
    } catch (e) {
      const errorViewData: ChangeErrorViewData = {
        bookingRef,
        slotUnavailable: false,
        canRetry: true,
      };
      await this.reloadBookings(req, bookingRef, candidate);
      return res.render(PageNames.MANAGE_BOOKING_CHANGE_ERROR, errorViewData);
    }
    return this.renderPost(req, res, candidate, bookingEdits);
  };

  private executeBslChange = async (req: Request, res: Response, bookingRef: string, bookingId: string, bookingProductId: string, candidate: Candidate, bookingEdits: ManageBookingEdits, booking: SessionBooking): Promise<void> => {
    const { bsl } = bookingEdits;
    const { origin } = booking;

    const updatedBsl = bsl ? CRMAdditionalSupport.BritishSignLanguage : CRMAdditionalSupport.None;

    try {
      await this.updateAdditionalSupportInCrm(bookingRef, bookingId, bookingProductId, updatedBsl, origin);
      await this.reloadBookings(req, bookingRef, candidate);
    } catch (e) {
      const errorViewData: ChangeErrorViewData = {
        bookingRef,
        slotUnavailable: false,
        canRetry: true,
      };
      await this.reloadBookings(req, bookingRef, candidate);
      return res.render(PageNames.MANAGE_BOOKING_CHANGE_ERROR, errorViewData);
    }
    return this.renderPost(req, res, candidate, bookingEdits);
  };

  private renderPost = async (req: Request, res: Response, candidate: Candidate, bookingEdits: ManageBookingEdits): Promise<void> => {
    const { currentBooking } = req.session;

    const changedBooking: SessionBooking = {
      ...currentBooking,
      centre: bookingEdits?.centre || currentBooking?.centre,
      dateTime: bookingEdits?.dateTime || currentBooking?.dateTime || '',
      bsl: bookingEdits?.bsl || currentBooking?.bsl || false,
      language: bookingEdits?.language || currentBooking?.language || Language.ENGLISH,
    };
    const { target, locale } = req.session;

    if (currentBooking) {
      await this.sendRescheduledEmail(changedBooking, candidate, target || Target.GB, locale || Locale.GB);
    }

    const confirmChangeViewData: ConfirmChangeViewData = {
      booking: {
        reference: currentBooking?.bookingRef || '',
        language: new TestLanguage(bookingEdits?.language || currentBooking?.language || '').toString(),
        testType: currentBooking?.testType as TestType,
        bsl: (bookingEdits?.bsl ?? currentBooking?.bsl) ? translate('generalContent.yes') : translate('generalContent.no'),
        voiceover: bookingEdits?.voiceover || currentBooking?.voiceover || Voiceover.NONE,
        testCentre: {
          name: bookingEdits?.centre?.name || currentBooking?.centre?.name || '',
          addressLine1: bookingEdits?.centre?.addressLine1 || currentBooking?.centre?.addressLine1,
          addressLine2: bookingEdits?.centre?.addressLine2 || currentBooking?.centre?.addressLine2,
          addressCity: bookingEdits?.centre?.addressCity || currentBooking?.centre?.addressCity || '',
          addressCounty: bookingEdits?.centre?.addressCounty || currentBooking?.centre?.addressCounty,
          addressPostalCode: bookingEdits?.centre?.addressPostalCode || currentBooking?.centre?.addressPostalCode || '',
        },
        testDate: bookingEdits?.dateTime || currentBooking?.dateTime || '',
      },
      latestRefundDate: currentBooking?.lastRefundDate,
      voiceoverRequested: this.isVoiceoverRequested(bookingEdits?.voiceover || currentBooking?.voiceover),
      bslAvailable: bslIsAvailable(currentBooking?.testType),
      voiceoverAvailable: TestVoiceover.isAvailable(currentBooking?.testType as TestType),
    };

    this.resetBookingSession(req);

    const dvaInstructorTestTypes: TestType[] = [TestType.ADIP1DVA, TestType.AMIP1];

    return res.render(PageNames.MANAGE_BOOKING_CHANGE_CONFIRMATION, {
      ...confirmChangeViewData,
      isInstructor: dvaInstructorTestTypes.includes(currentBooking?.testType as TestType),
    });
  };

  private isVoiceoverRequested = (voiceover?: Voiceover): boolean => !voiceover || voiceover !== Voiceover.NONE;

  private sendRescheduledEmail = async (booking: SessionBooking, candidate: Candidate, target: Target, lang: Locale): Promise<void> => {
    const { email, candidateId } = candidate;
    try {
      logger.info('ManageBookingCheckChangeController::sendRescheduledEmail: Sending rescheduling email', {
        bookingRef: booking.bookingRef,
        candidateId,
      });
      if (!booking.bookingRef || !booking.testType || !booking.dateTime || !booking.centre || !booking.lastRefundDate) {
        logger.warn('ManageBookingCheckChangeController::sendRescheduledEmail: Missing data in session', {
          bookingRef: !booking.bookingRef,
          testType: !booking.testType,
          dateTime: !booking.dateTime,
          centre: !booking.centre,
          lastRefundDate: !booking.lastRefundDate,
          candidateId,
        });
        throw new Error('ManageBookingCheckChangeController::sendRescheduledEmail: Unable to generate email content due to missing data in session');
      }
      const bookingRescheduleDetails: BookingRescheduledDetails = {
        bookingRef: booking.bookingRef,
        testType: booking.testType,
        testDateTime: booking.dateTime,
        testCentre: booking.centre,
        lastRefundDate: booking.lastRefundDate,
      };
      const emailContent = buildBookingRescheduledEmailContent(bookingRescheduleDetails, target, lang);
      if (!email) {
        throw new Error('ManageBookingCheckChangeController::sendRescheduledEmail Unable to send email to candidate due to missing email in session');
      }
      await this.notifications.sendEmail(email, emailContent, booking.bookingRef, target);
    } catch (error) {
      logger.error(error, 'ManageBookingCheckChangeController::sendRescheduledEmail: Could not send booking reschedule email', {
        candidateId,
      });
    }
  };

  public async reloadBookings(req: Request, bookingRef: string, candidate: Candidate): Promise<void> {
    if (!candidate.candidateId) {
      throw new Error('ManageBookingCheckChangeController::reloadBookings: Unable to load candidate bookings no candidate id in session');
    }

    await this.bookingManager.loadCandidateBookings(req, candidate.candidateId);
    let booking = store.manageBooking.getBooking(req, bookingRef);
    if (booking) {
      booking = await this.calculateThreeWorkingDays(req, booking);
      req.session.currentBooking = {
        ...req.session.currentBooking,
        ...mapBookingEntityToSessionBooking(booking),
      };
    }
  }

  private async calculateThreeWorkingDays(req: Request, booking: Booking): Promise<Booking> {
    if (booking && !booking.testIsToday()) {
      const { testDate, testCentre: { remit } } = booking.details;
      const result = await this.crm.calculateThreeWorkingDays(testDate as unknown as string, remit);
      return store.manageBooking.updateBooking(req, booking.details.reference, {
        testDateMinus3ClearWorkingDays: result,
      });
    }
    // Update is when you change voiceover language | accommodations etc.
    return booking;
  }

  public reset = (req: Request, res: Response): void => {
    const bookingReference = req.session.currentBooking?.bookingRef;

    this.resetBookingSession(req);

    return res.redirect(`/manage-booking/${bookingReference || ''}`);
  };

  private resetBookingSession(req: Request): void {
    req.session.manageBookingEdits = undefined;
    req.session.currentBooking = undefined;
    req.session.testCentreSearch = undefined;
    req.session.journey = {
      ...req.session.journey,
      inManagedBookingEditMode: false,
    };
  }

  private setChangeInProgressInCRM = async (bookingRef: string, bookingId: string, origin?: Origin): Promise<void> => {
    try {
      logger.debug('ManageBookingCheckChangeController::setChangeInProgressInCRM: Attempting to set booking status to Change in Progress', {
        bookingRef,
        bookingId,
      });
      return await this.crm.updateBookingStatus(bookingId, CRMBookingStatus.ChangeInProgress, origin === Origin.CustomerServiceCentre);
    } catch (error) {
      logger.error(error, 'ManageBookingCheckChangeController::setChangeInProgressInCRM: Failed to set status of Change in Progress in CRM after 3 retries', {
        bookingRef,
        bookingId,
      });
      throw error;
    }
  };

  private updateTimeAndLocationInCrm = async (bookingRef: string, bookingId: string, dateTime: string, centre: Centre, req: Request, candidate: Candidate, origin?: Origin, preferredDate?: string, kpiIdentifiers?: KPIIdentifiers): Promise<void> => {
    try {
      logger.debug('ManageBookingCheckChangeController::updateTimeAndLocationInCrm: Attempting to store updated booking location and/or time and date', {
        bookingRef,
        dateTime,
        siteId: centre.siteId,
        centreName: centre.name,
        preferredDate,
        ...kpiIdentifiers,
      });
      const rescheduleCount = await this.crm.getRescheduleCount(bookingId);
      await this.crm.rescheduleBookingAndConfirm(bookingId, dateTime, rescheduleCount, origin === Origin.CustomerServiceCentre, centre.accountId, preferredDate, kpiIdentifiers);
    } catch (error) {
      logger.error(error, 'ManageBookingCheckChangeController::updateTimeAndLocationInCrm: Failed to store updated booking location and/or time and date in CRM after max retries', {
        bookingRef,
        dateTime,
        siteId: centre.siteId,
        centreName: centre.name,
      });
      await this.reloadBookings(req, bookingRef, candidate);
      throw error;
    }
  };

  private updateAdditionalSupportInCrm = async (bookingRef: string, bookingId: string, bookingProductId: string, additionalSupport: CRMAdditionalSupport, origin?: Origin): Promise<void> => {
    try {
      logger.debug('ManageBookingCheckChangeController::updateAdditionalSupportInCrm: Attempting to store updated additional support options', {
        bookingRef,
        bookingId,
        bookingProductId,
      });
      await this.crm.updateAdditionalSupport(bookingId, bookingProductId, additionalSupport, origin === Origin.CustomerServiceCentre);
    } catch (error) {
      logger.error(error, 'ManageBookingCheckChangeController::updateAdditionalSupportInCrm: Failed to store updated additional support options for booking in CRM after max retries', {
        bookingRef,
        bookingId,
        bookingProductId,
      });
      throw error;
    }
  };

  private updateVoiceoverInCrm = async (bookingRef: string, bookingId: string, bookingProductId: string, voiceover: CRMVoiceOver, origin?: Origin): Promise<void> => {
    try {
      logger.debug('ManageBookingCheckChangeController::updateVoiceoverInCrm: Attempting to store updated voiceover', {
        bookingRef,
        bookingId,
        bookingProductId,
      });
      await this.crm.updateVoiceover(bookingId, bookingProductId, voiceover, origin === Origin.CustomerServiceCentre);
    } catch (error) {
      logger.error(error, 'ManageBookingCheckChangeController::updateVoiceoverInCrm: Failed to store updated voiceover for booking in CRM after max retries', {
        bookingRef,
        bookingId,
        bookingProductId,
      });
      throw error;
    }
  };

  private updateTCNUpdateDate = async (bookingRef: string, bookingProductId: string, req: Request, candidate: Candidate): Promise<void> => {
    try {
      logger.debug('ManageBookingCheckChangeController::updateTCNUpdateDate: Attempting to update TCN update date in CRM', {
        bookingRef,
        bookingProductId,
      });
      await this.crm.updateTCNUpdateDate(bookingProductId);
    } catch (error) {
      logger.error(error, 'ManageBookingCheckChangeController::updateTCNUpdateDate: Failed to update TCN update date in CRM after max retries', {
        bookingRef,
        bookingProductId,
      });
      await this.reloadBookings(req, bookingRef, candidate);
      throw error;
    }
  };

  private updateLanguage = async (bookingRef: string, bookingId: string, bookingProductId: string, language: CRMTestLanguage, origin?: Origin): Promise<void> => {
    try {
      logger.debug('ManageBookingCheckChangeController::updateLanguage: Attempting to store updated booking language', {
        bookingRef,
        bookingId,
        bookingProductId,
      });
      await this.crm.updateLanguage(bookingId, bookingProductId, language, origin === Origin.CustomerServiceCentre);
    } catch (error) {
      logger.error(error, 'ManageBookingCheckChangeController::updateLanguage: Failed to store updated booking language in CRM after max retries', {
        bookingRef,
        bookingId,
        bookingProductId,
      });
      throw error;
    }
  };
}

export default new ManageBookingCheckChangeController(
  CRMGateway.getInstance(),
  SchedulingGateway.getInstance(),
  notificationsGateway,
  BookingManager.getInstance(CRMGateway.getInstance()),
);
