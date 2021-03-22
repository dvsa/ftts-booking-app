import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Request, Response } from 'express';

import { FutureBookingDate } from '../../domain/future-booking-date';
import { Slot, AppointmentSlot } from '../../domain/slot';
import { ValidatorSchema } from '../../middleware/request-validator';
import { VisibleMonths } from './visible-months';
import { Centre } from '../../domain/types';
import { store } from '../../services/session';
import { Scheduler } from '../../services/scheduling/scheduling-service';
import config from '../../config';
import { TestType } from '../../domain/enums';

interface Day {
  date?: string;
  difference: number;
  distance?: number;
  mobile?: boolean;
}
interface SlotsResponse {
  days: Map<string, Day>;
  slots: Map<string, Slot>;
  ampm: Map<string, boolean>;
}

interface ChooseAppointmentBody {
  slotId: string;
}

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

export class ChooseAppointmentController {
  constructor(private scheduling: Scheduler) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    dayjs.tz.setDefault(config.defaultTimeZone);
    if (!store.currentBooking.get(req).centre) {
      return res.redirect(this.getSelectTestCentreLink(req));
    }

    if (req.hasErrors) {
      return res.status(400).render('choose-appointment', {
        errors: req.errors,
      });
    }

    return this.renderChooseAppointment(req, res);
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      return this.renderChooseAppointment(req, res);
    }

    try {
      const { slotId } = req.body as ChooseAppointmentBody;
      const dateTime: string = slotId;
      if (!dateTime) {
        throw Error('Slot ID not set');
      }

      if (this.isManagedBookingSession(req)) {
        store.manageBookingEdits.update(req, { dateTime });
      } else {
        const { inEditMode } = store.journey.get(req);
        if (!inEditMode) {
          store.currentBooking.update(req, {
            dateTime,
          });
        } else {
          store.editedLocationTime.update(req, {
            dateTime,
          });
        }
      }

      return res.redirect(this.getCheckAnswersLink(req));
    } catch (err) {
      return res.status(500).render('error500');
    }
  };

  private async renderChooseAppointment(req: Request, res: Response): Promise<void> {
    const booking = store.currentBooking.get(req);
    const testCentreSearch = store.testCentreSearch.get(req);

    const { inEditMode } = store.journey.get(req);
    const newEditedCentre = store.editedLocationTime.get(req).centre;
    let selectedCentre: Centre = (inEditMode && newEditedCentre) ? newEditedCentre : booking.centre;

    if (this.isManagedBookingSession(req)) {
      const { centre } = store.manageBookingEdits.get(req);
      if (centre) {
        selectedCentre = centre;
      }
    }

    const { testType } = booking;
    const selectedDate: Dayjs = dayjs(req.query.selectedDate as string || testCentreSearch.selectedDate);
    const search = testCentreSearch.searchQuery;
    const {
      days, slots, ampm,
    } = await this.getAppointments(selectedDate, selectedCentre, testType);
    const today = dayjs().startOf('day');
    const sixMonths = dayjs().add(6, 'month');
    const navigation = {
      desktop: {
        previous: selectedDate.subtract(7, 'day').toISOString(),
        next: selectedDate.add(7, 'day').toISOString(),
      },
      mobile: {
        previous: this.navigatePreviousDateMobile(selectedDate).toISOString(),
        next: this.navigateNextDateMobile(selectedDate).toISOString(),
      },
    };

    const selectDateLink = this.getBackLink(req);

    return res.render('choose-appointment', {
      selectedCentre,
      selectedDate: selectedDate.format('dddd DD MMMM YYYY'),
      slots,
      search,
      days,
      ampm,
      navigation,
      isBeforeToday: selectedDate.isBefore(today),
      isAfterSixMonths: selectedDate.isAfter(sixMonths),
      selectDateLink,
      errors: req.errors,
    });
  }

  async getAppointments(selectedDate: Dayjs, selectedCentre: Centre, testType: TestType): Promise<SlotsResponse> {
    const dateFrom = selectedDate.startOf('isoWeek');
    const dateTo = selectedDate.endOf('isoWeek');
    const dates = this.getDatesBetween(dateFrom, dateTo);

    let newSlots: AppointmentSlot[] = [];

    newSlots = await this.scheduling.availableSlots(selectedDate, selectedCentre, testType);
    const slots = new Map();
    const days = new Map();
    const ampm = new Map();

    // Pick out only slots that are for the selected date
    newSlots.forEach((slot) => this.slotProcessor(slot, slots, days, selectedDate, ampm));

    dates.forEach((date) => {
      const dateDiff = date.diff(selectedDate, 'day');
      days.set(date.toISOString(), {
        distance: dateDiff,
        mobile: this.canShowOnMobile(date, selectedDate, dateFrom, dateTo),
        date: dayjs(date).toISOString(),
        displayDay: dayjs(date).format('dddd'),
        displayDate: dayjs(date).format('DD MMMM'),
      });
    });

    return Promise.resolve({
      days,
      slots,
      ampm,
    });
  }

  getDatesBetween(startDate: Dayjs, endDate: Dayjs): Dayjs[] {
    let currentDate = startDate;
    const dates: Dayjs[] = [];
    while (currentDate.isBefore(endDate)) {
      dates.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    return dates;
  }

  slotProcessor(slot: AppointmentSlot, slotsMap: Map<string, AppointmentSlot>, daysMap: Map<string, Day>, baseDate: Dayjs, ampm: Map<string, boolean>): void {
    const midday = `${baseDate.format('YYYY-MM-DD')}T12:00:00`;
    const now = dayjs();
    const sixMonths = dayjs().endOf('day').add(6, 'month');
    if (dayjs(slot.startDateTime).startOf('day').isSame(baseDate) && dayjs(slot.startDateTime).isAfter(now) && dayjs(slot.startDateTime).isBefore(sixMonths)) {
      slot.isMorning = dayjs(slot.startDateTime).isBefore(dayjs(midday));
      slot.displayTime = dayjs(slot.startDateTime).tz(config.defaultTimeZone).format('h:mm');
      if (slot.isMorning) {
        ampm.set('morning', true);
      } else {
        ampm.set('afternoon', true);
      }
      slotsMap.set(slot.startDateTime, slot);
    }
  }

  navigatePreviousDateMobile(selectedDate: Dayjs): Dayjs {
    const startOfWeekDiff = selectedDate.diff(selectedDate.startOf('week'), 'day');

    if (startOfWeekDiff <= 2) {
      return selectedDate.subtract(2, 'day').startOf('day');
    }

    return selectedDate.subtract(3, 'day').startOf('day');
  }

  navigateNextDateMobile(selectedDate: Dayjs): Dayjs {
    const endOfWeekDiff = selectedDate.diff(selectedDate.endOf('week'), 'day');

    if (endOfWeekDiff >= -2) {
      return selectedDate.add(2, 'day');
    }

    return selectedDate.add(3, 'day').startOf('day');
  }

  canShowOnMobile(date: Dayjs, selectedDate: Dayjs, dateFrom: Dayjs, dateTo: Dayjs): boolean {
    const dateDiff = date.diff(selectedDate, 'day');

    if (selectedDate.isSame(dateFrom) && dateDiff <= 2) {
      return true;
    }

    if (selectedDate.isSame(dateTo.startOf('day')) && dateDiff >= -2) {
      return true;
    }

    if (dateDiff >= -1 && dateDiff <= 1) {
      return true;
    }

    return false;
  }

  private getBackLink(req: Request): string {
    if (!this.isManagedBookingSession(req)) {
      return '/select-date';
    }

    // go back a page or go back to manage booking rescheduling choices
    const bookingReference = store.currentBooking.get(req).bookingRef;
    return req.url.startsWith(store.journey.get(req).managedBookingRescheduleChoice) ? `/manage-change-location-time/${bookingReference}` : '/manage-booking/select-date';
  }

  private getCheckAnswersLink(req: Request): string {
    if (this.isManagedBookingSession(req)) {
      return '/manage-booking/check-change';
    }

    return '/check-your-answers';
  }

  private getSelectTestCentreLink(req: Request): string {
    if (this.isManagedBookingSession(req)) {
      return '/manage-booking/select-test-centre';
    }

    return '/select-test-centre';
  }

  private isManagedBookingSession(req: Request): boolean {
    return store.journey.get(req).inManagedBookingEditMode;
  }

  public getSchemaValidation: ValidatorSchema = {
    current: {
      in: ['query'],
      optional: true,
      custom: {
        options: VisibleMonths.isValid,
      },
    },
    theoryTestDate: {
      in: ['query'],
      optional: true,
      custom: {
        options: FutureBookingDate.isValid,
      },
    },
  };

  public postSchemaValidation: ValidatorSchema = {
    slotId: {
      in: ['body'],
      isEmpty: {
        errorMessage: 'Booking Slot is required. Please pick a Slot.',
        negated: true,
      },
    },
    ...this.getSchemaValidation,
  };
}

export default new ChooseAppointmentController(Scheduler.getInstance());
