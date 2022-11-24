import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { bslIsAvailable } from '../../domain/bsl';
import { isZeroCostTest } from '../../domain/eligibility';
import { TestLanguage } from '../../domain/test-language';
import { Voiceover, Target, TestType } from '../../domain/enums';
import { logger } from '../../helpers/logger';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { SchedulingGateway, SlotUnavailableError } from '../../services/scheduling/scheduling-gateway';
import { Booking } from '../../services/session';
import { BookingHandler } from '../../helpers/booking-handler';
import { translate } from '../../helpers/language';
import { CrmCreateBookingDataError } from '../../domain/errors/crm/CrmCreateBookingDataError';
import { getErrorPageLink } from '../../helpers/links';
import config from '../../config';

export class InstructorCheckYourAnswersController {
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
    const { target } = req.session;
    req.session.journey = {
      ...req.session.journey,
      inEditMode: false,
    };

    req.session.currentBooking = {
      ...req.session.currentBooking,
      governmentAgency: target,
    };

    if (!req.session.currentBooking.testType) {
      throw new Error('InstructorCheckYourAnswersController::post: Missing test type');
    }

    if (config.featureToggles.enableExistingBookingValidation) {
      const hasExistingBooking = await this.crmGateway.doesCandidateHaveExistingBookingsByTestType(req.session.candidate?.candidateId as string, req.session.currentBooking?.testType);

      if (hasExistingBooking) {
        req.session.lastPage = '/instructor/check-your-answers';
        return res.redirect('booking-exists');
      }
    }

    try {
      const handler = new BookingHandler(this.crmGateway, req, this.scheduling);
      await handler.createBooking();
    } catch (error) {
      if (error instanceof SlotUnavailableError) {
        logger.warn('InstructorCheckYourAnswersController::post: Slot is unavailable - cannot reserve slot');
        return res.render(PageNames.ERROR_SLOT_UNAVAILABLE);
      }
      if (error instanceof CrmCreateBookingDataError) {
        return res.redirect(getErrorPageLink('/error-technical', req));
      }

      logger.error(error, 'InstructorCheckYourAnswersController::post: Error creating booking entity in CRM');
      throw error;
    }

    if (req.session.currentBooking.compensationBooking) {
      return res.redirect('payment-confirmation');
    }

    if (isZeroCostTest(req.session.currentBooking.testType)) {
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

    return res.render(PageNames.INSTRUCTOR_CHECK_YOUR_ANSWERS, {
      firstNames: candidate?.firstnames,
      surname: candidate?.surname,
      dateOfBirth: candidate?.dateOfBirth,
      licenceNumber: candidate?.licenceNumber,
      emailAddress: candidate?.email,
      testLanguage,
      price: isCompensationBooking ? booking?.compensationBooking?.price : booking?.priceList?.price,
      isCompensationBooking: !!booking?.compensationBooking,
      dateTime: booking?.dateTime,
      testCentre: booking?.centre,
      testType: booking?.testType,
      supportRequested: this.getYesNoLabel(false),
      bslAvailable: bslIsAvailable(booking?.testType),
      canChangeTestLanguage: TestLanguage.canChangeTestLanguage(req.session.target || Target.GB, booking?.testType as TestType),
      bsl: this.getYesNoLabel(booking?.bsl || false),
      voiceover: voiceover === Voiceover.NONE ? this.getYesNoLabel(false) : booking?.voiceover,
      bookingRequiresPayment: !isZeroCostTest(booking?.testType as TestType),
      canChooseSupport: req.session.target !== Target.NI,
      isZeroCostBooking: isZeroCostTest(booking?.testType as TestType),
      errors: req.errors,
    });
  }

  private getYesNoLabel(value: boolean): string {
    return value ? translate('generalContent.yes') : translate('generalContent.no');
  }
}

export default new InstructorCheckYourAnswersController(
  SchedulingGateway.getInstance(),
  CRMGateway.getInstance(),
);
