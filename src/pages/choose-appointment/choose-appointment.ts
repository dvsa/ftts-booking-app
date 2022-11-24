import dayjs, { Dayjs } from 'dayjs';
import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { ValidatorSchema } from '../../middleware/request-validator';
import { Centre, Eligibility } from '../../domain/types';
import { translate } from '../../helpers/language';
import { hasSlotsKpis } from '../../services/scheduling/scheduling-helper';
import { toISODateString, UtcDate } from '../../domain/utc-date';
import { AppointmentService } from '../../services/appointment/appointment-service';
import { TestType } from '../../domain/enums';
import { AppointmentSlot, KPIIdentifiers } from '../../services/scheduling/types';

export interface ChooseAppointmentBody {
  slotId: string;
}

export class ChooseAppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.journey) {
      throw Error('ChooseAppointmentController::get: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('ChooseAppointmentController::get: No currentBooking set');
    }
    if (!req.session.currentBooking.centre) {
      return res.redirect(this.getSelectTestCentreLink(req));
    }

    if (req.hasErrors) {
      return res.status(400).render(PageNames.CHOOSE_APPOINTMENT, {
        errors: req.errors,
      });
    }

    return this.renderPage(req, res);
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }
    if (!req.session.journey) {
      throw Error('ChooseAppointmentController::post: No journey set');
    }

    const { slotId: dateTime } = req.body as ChooseAppointmentBody;
    if (this.isManagedBookingSession(req)) {
      req.session.manageBookingEdits = {
        ...req.session.manageBookingEdits,
        dateTime,
      };
    } else {
      const { inEditMode } = req.session.journey;
      if (!inEditMode) {
        req.session.currentBooking = {
          ...req.session.currentBooking,
          dateTime,
        };
      } else {
        req.session.editedLocationTime = {
          ...req.session.editedLocationTime,
          dateTime,
        };
      }
    }

    return res.redirect(this.getCheckAnswersLink(req));
  };

  private async renderPage(req: Request, res: Response): Promise<void> {
    if (!req.session.journey) {
      throw Error('ChooseAppointmentController::renderPage: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('ChooseAppointmentController::renderPage: No currentBooking set');
    }
    if (!req.session.candidate?.eligibilities && !req.session.manageBooking?.candidate?.eligibilities) {
      throw Error('ChooseAppointmentController::renderPage: No candidate eligibilities set');
    }
    const booking = req.session.currentBooking;
    if (!booking.centre) {
      throw Error('ChooseAppointmentController::renderPage: No booking.centre set');
    }
    const { testType } = booking;
    let { firstSelectedDate } = booking;
    if (!testType) {
      throw Error('ChooseAppointmentController::renderPage: No testType set');
    }
    const { testCentreSearch } = req.session;

    const candidateEligibilities = req.session.candidate?.eligibilities || req.session.manageBooking?.candidate?.eligibilities;
    const testEligibility = this.getTestEligibility(candidateEligibilities, booking.testType);

    const { inEditMode } = req.session.journey;
    const newEditedCentre = req.session.editedLocationTime?.centre;
    let selectedCentre: Centre;
    if (inEditMode && newEditedCentre) {
      selectedCentre = newEditedCentre;
    } else {
      selectedCentre = booking.centre;
    }

    if (this.isManagedBookingSession(req)) {
      const centre = req.session.manageBookingEdits?.centre;
      if (centre) {
        selectedCentre = centre;
      }
    }

    if (hasSlotsKpis(booking)) {
      // We only want to request the KPI's once per session
      firstSelectedDate = undefined;
    }

    const selectedDate = dayjs(req.query.selectedDate as string || testCentreSearch?.selectedDate).tz();

    const { slotsByDate, kpiIdentifiers } = await this.appointmentService.getSlots(selectedDate, selectedCentre, testType, testEligibility, firstSelectedDate);
    const { morningSlots, afternoonSlots } = this.splitIntoMorningAndAfternoonSlots(slotsByDate, selectedDate);
    this.storeKpiIdentifiersInSession(kpiIdentifiers, req);

    const today = dayjs().tz().startOf('day');
    const sixMonths = dayjs().tz().add(6, 'month').subtract(1, 'day');
    const { weekView, weekViewMobile, navigation } = this.buildNavigation(selectedDate);
    const renderParameters = {
      weekView,
      weekViewMobile,
      navigation,
      slotsByDate,
      morningSlots,
      afternoonSlots,
      selectedDate: toISODateString(selectedDate),
      isBeforeToday: selectedDate.isBefore(today),
      isAfterSixMonths: selectedDate.isAfter(sixMonths),
      isBeforeEligible: testEligibility.eligibleFrom ? selectedDate.isBefore(dayjs.tz(testEligibility.eligibleFrom), 'date') : false,
      isAfterEligible: testEligibility.eligibleTo ? selectedDate.isAfter(dayjs.tz(testEligibility.eligibleTo), 'date') : false,
      eligibleFromDate: testEligibility.eligibleFrom,
      testCentreName: selectedCentre.name,
      backLink: this.getBackLink(req),
      checkAnswersLink: this.getCheckAnswersLink(req),
      errors: req.errors,
    };

    return res.render(PageNames.CHOOSE_APPOINTMENT, renderParameters);
  }

  private getTestEligibility(candidateEligibilities: Eligibility[] | undefined, testType: TestType | undefined) {
    const testEligibility = candidateEligibilities?.find((eligibility) => eligibility.testType === testType);
    if (!testEligibility) {
      throw Error('ChooseAppointmentController::getTestEligibility: No eligibility data found');
    }
    // Ignore eligibleFrom and eligibleTo for ERS instructor tests (needed for rescheduling)
    if (testEligibility.testType === TestType.ERS) {
      testEligibility.eligibleFrom = undefined;
      testEligibility.eligibleTo = undefined;
    }
    return testEligibility;
  }

  private splitIntoMorningAndAfternoonSlots(slotsByDate: Record<string, AppointmentSlot[]>, selectedDate: Dayjs) {
    const slotsOnSelectedDate = slotsByDate[toISODateString(selectedDate)] ?? [];
    const midday = dayjs.tz(`${toISODateString(selectedDate)}T12:00:00`); // Parse in local time
    const morningSlots = slotsOnSelectedDate.filter((slot: AppointmentSlot) => dayjs(slot.startDateTime).tz().isBefore(midday.tz()));
    const afternoonSlots = slotsOnSelectedDate.filter((slot: AppointmentSlot) => !dayjs(slot.startDateTime).tz().isBefore(midday.tz()));
    return { morningSlots, afternoonSlots };
  }

  private storeKpiIdentifiersInSession(kpiIdentifiers: KPIIdentifiers | undefined, req: Request): void {
    if (kpiIdentifiers) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        ...kpiIdentifiers,
      };
    }
  }

  private buildNavigation(selectedDate: Dayjs) {
    const weekView = this.appointmentService.getWeekViewDatesDesktop(selectedDate);
    const weekViewMobile = this.appointmentService.getWeekViewDatesMobile(selectedDate, weekView[0], weekView[6]);
    const navigation = {
      desktop: {
        previous: toISODateString(selectedDate.subtract(7, 'day')),
        next: toISODateString(selectedDate.add(7, 'day')),
      },
      mobile: {
        previous: this.appointmentService.getPreviousDateMobile(selectedDate),
        next: this.appointmentService.getNextDateMobile(selectedDate),
      },
    };
    return { weekView, weekViewMobile, navigation };
  }

  private getBackLink(req: Request): string {
    if (!this.isManagedBookingSession(req)) {
      return 'select-date';
    }
    if (!req.session.journey || req.session.journey.managedBookingRescheduleChoice === undefined) {
      throw Error('ChooseAppointmentController::getBackLink: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('ChooseAppointmentController::getBackLink: No currentBooking set');
    }

    // go back a page or go back to manage booking rescheduling choices
    const bookingReference = req.session.currentBooking.bookingRef;
    const backLink = req.session.journey.managedBookingRescheduleChoice.length && req.url.startsWith(req.session.journey.managedBookingRescheduleChoice)
      ? `manage-change-location-time/${bookingReference}`
      : 'select-date';

    return backLink;
  }

  private getCheckAnswersLink(req: Request): string {
    if (this.isManagedBookingSession(req)) {
      return '/manage-booking/check-change';
    }

    return 'check-your-answers';
  }

  private getSelectTestCentreLink(req: Request): string {
    if (this.isManagedBookingSession(req)) {
      return '/manage-booking/select-test-centre';
    }

    return 'select-test-centre';
  }

  private isManagedBookingSession(req: Request): boolean {
    return Boolean(req.session.journey?.inManagedBookingEditMode);
  }

  /* istanbul ignore next */
  public getSchemaValidation: ValidatorSchema = {
    selectedDate: {
      in: ['query'],
      optional: true,
      custom: {
        options: UtcDate.isValidIsoDateString,
      },
    },
  };

  /* istanbul ignore next */
  public postSchemaValidation: ValidatorSchema = {
    slotId: {
      in: ['body'],
      isEmpty: {
        errorMessage: 'Booking Slot is required. Please pick a Slot.',
        negated: true,
        bail: true,
      },
      custom: {
        errorMessage: (): string => translate('chooseAppointment.errorMessages.invalidSlot'),
        options: UtcDate.isValidIsoTimeStamp,
      },
    },
  };
}

export default new ChooseAppointmentController(
  new AppointmentService(),
);
