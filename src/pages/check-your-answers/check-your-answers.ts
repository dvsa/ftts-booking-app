/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';

import { PageNames } from '@constants';
import { SchedulingGateway, SlotUnavailableError } from '../../services/scheduling/scheduling-gateway';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { BookingHandler } from '../../helpers/booking-handler';
import { Booking } from '../../services/session';
import { translate } from '../../helpers/language';
import { bslIsAvailable } from '../../domain/bsl';
import { TestLanguage } from '../../domain/test-language';
import { TestType, Voiceover } from '../../domain/enums';
import {
  canChangeBsl, canChangeVoiceover, canShowBslChangeButton, canShowVoiceoverChangeButton,
} from '../../helpers/support';
import { logger } from '../../helpers/logger';
import config from '../../config';
import { CrmCreateBookingDataError } from '../../domain/errors/crm/CrmCreateBookingDataError';
import { getErrorPageLink } from '../../helpers/links';

export class CheckYourAnswersController {
  constructor(
    private scheduling: SchedulingGateway,
    private crmGateway: CRMGateway,
  ) { }

  public get = (req: Request, res: Response): void => {
    req.session.journey = {
      ...req.session.journey,
      inEditMode: true,
      standardAccommodation: true,
    };

    this.renderPage(req, res);
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    const booking = req.session.currentBooking;
    const voiceover = booking?.voiceover ?? Voiceover.NONE;

    if (booking?.bsl && voiceover !== Voiceover.NONE) {
      req.hasErrors = true;
      req.errors = [{ param: 'bslChange', msg: translate('checkYourAnswers.error.bslVoiceoverOption.contentLine1'), location: 'body' }];

      return this.renderPage(req, res);
    }

    const { target } = req.session;
    req.session.journey = {
      ...req.session.journey,
      inEditMode: false,
    };

    req.session.currentBooking = {
      ...req.session.currentBooking,
      governmentAgency: target,
    };

    if (config.featureToggles.enableExistingBookingValidation) {
      const hasExistingBooking = await this.crmGateway.doesCandidateHaveExistingBookingsByTestType(req.session.candidate?.candidateId as string, req.session.currentBooking?.testType as TestType);

      if (hasExistingBooking) {
        req.session.lastPage = '/check-your-answers';
        return res.redirect('booking-exists');
      }
    }

    try {
      const handler = new BookingHandler(this.crmGateway, req, this.scheduling);
      await handler.createBooking();
    } catch (error) {
      if (error instanceof SlotUnavailableError) {
        logger.warn('CheckYourAnswersController::post: Slot is unavailable - cannot reserve slot');
        return res.render(PageNames.ERROR_SLOT_UNAVAILABLE);
      }
      if (error instanceof CrmCreateBookingDataError) {
        return res.redirect(getErrorPageLink('/error-technical', req));
      }

      logger.error(error, 'CheckYourAnswersController::post: Error creating booking entity in CRM');
      throw error;
    }

    if (req.session.currentBooking.compensationBooking) {
      return res.redirect('payment-confirmation');
    }

    return res.redirect('payment-initiation');
  };

  private renderPage(req: Request, res: Response): void {
    const centre = req.session.editedLocationTime?.centre;
    const dateTime = req.session.editedLocationTime?.dateTime;
    const updatedLocationTime: Partial<Booking> = {};
    if (dateTime) {
      updatedLocationTime.dateTime = dateTime;
      if (centre) {
        updatedLocationTime.centre = centre;
      }
      req.session.currentBooking = {
        ...req.session.currentBooking,
        ...updatedLocationTime,
      };
    }
    req.session.editedLocationTime = undefined;

    const booking = req.session.currentBooking;
    const testLanguage = TestLanguage.from(booking?.language || '').toString();
    const voiceover = booking?.voiceover ?? Voiceover.NONE;
    const { candidate } = req.session;

    const isCompensationBooking = !!booking?.compensationBooking;

    return res.render(PageNames.CHECK_YOUR_ANSWERS, {
      firstNames: candidate?.firstnames,
      surname: candidate?.surname,
      dateOfBirth: candidate?.dateOfBirth,
      licenceNumber: candidate?.licenceNumber,
      emailAddress: candidate?.email,
      testLanguage,
      price: isCompensationBooking ? booking?.compensationBooking?.price : booking?.priceList?.price,
      isCompensationBooking,
      dateTime: booking?.dateTime,
      testCentre: booking?.centre,
      testType: booking?.testType,
      supportRequested: this.getYesNoLabel(false),
      bslAvailable: bslIsAvailable(booking?.testType),
      bsl: this.getYesNoLabel(booking?.bsl || false),
      canChangeBsl: canChangeBsl(voiceover),
      showBslChangeButton: canShowBslChangeButton(booking?.bsl, voiceover),
      voiceover: voiceover === Voiceover.NONE ? this.getYesNoLabel(false) : booking?.voiceover,
      canChangeVoiceover: canChangeVoiceover(booking?.bsl),
      showVoiceoverChangeButton: canShowVoiceoverChangeButton(voiceover, booking?.bsl),
      errors: req.errors,
    });
  }

  private getYesNoLabel(value: boolean): string {
    return value ? translate('generalContent.yes') : translate('generalContent.no');
  }
}

export default new CheckYourAnswersController(
  SchedulingGateway.getInstance(),
  CRMGateway.getInstance(),
);
