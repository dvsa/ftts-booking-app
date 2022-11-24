import dayjs, { Dayjs } from 'dayjs';
import { TestType } from '../../domain/enums';
import { AppointmentSlot, KPIIdentifiers } from '../scheduling/types';
import { Centre, Eligibility } from '../../domain/types';
import { SchedulingGateway } from '../scheduling/scheduling-gateway';
import { toISODateString } from '../../domain/utc-date';
import { logger } from '../../helpers/logger';

export class AppointmentService {
  constructor(
    private scheduling: SchedulingGateway = SchedulingGateway.getInstance(),
  ) { }

  public async getSlots(
    selectedDate: Dayjs, selectedCentre: Centre, testType: TestType, testEligibility?: Eligibility, preferredDate?: string,
  ): Promise<{ slotsByDate: Record<string, AppointmentSlot[]>; kpiIdentifiers?: KPIIdentifiers; }> {
    const dateFrom = this.calculateDateFrom(selectedDate, testEligibility?.eligibleFrom);
    const dateTo = this.calculateDateTo(selectedDate, testEligibility?.eligibleTo);
    if (dateFrom > dateTo) {
      logger.debug('AppointmentService::getSlots:dateFrom>dateTo');
      return { slotsByDate: {} };
    }
    const slots = await this.scheduling.availableSlots(dateFrom, dateTo, selectedCentre, testType, preferredDate);
    return {
      slotsByDate: this.groupSlotsByDate(slots, dateFrom, dateTo),
      kpiIdentifiers: this.getKpiIdentifiers(slots, preferredDate),
    };
  }

  public getWeekViewDatesDesktop(selectedDate: Dayjs): string[] {
    const startOfWeek = selectedDate.startOf('isoWeek');
    const endOfWeek = selectedDate.endOf('isoWeek');
    return this.getDatesBetween(startOfWeek, endOfWeek).map(toISODateString);
  }

  public getWeekViewDatesMobile(selectedDate: Dayjs, startOfWeek: string, endOfWeek: string): string[] {
    const dayBefore = selectedDate.subtract(1, 'day');
    const dayAfter = selectedDate.add(1, 'day');
    if (selectedDate.isSame(dayjs(startOfWeek).tz(), 'date')) {
      const twoDaysAfter = selectedDate.add(2, 'day');
      return [selectedDate, dayAfter, twoDaysAfter].map(toISODateString);
    }
    if (selectedDate.isSame(dayjs(endOfWeek).tz(), 'date')) {
      const twoDaysBefore = selectedDate.subtract(2, 'day');
      return [twoDaysBefore, dayBefore, selectedDate].map(toISODateString);
    }
    return [dayBefore, selectedDate, dayAfter].map(toISODateString);
  }

  public getPreviousDateMobile(selectedDate: Dayjs): string {
    const startOfWeekDiff = selectedDate.diff(selectedDate.startOf('week'), 'day');
    if (startOfWeekDiff <= 2) {
      return toISODateString(selectedDate.subtract(2, 'day'));
    }
    return toISODateString(selectedDate.subtract(3, 'day'));
  }

  public getNextDateMobile(selectedDate: Dayjs): string {
    const endOfWeekDiff = selectedDate.diff(selectedDate.endOf('week'), 'day');
    if (endOfWeekDiff >= -2) {
      return toISODateString(selectedDate.add(2, 'day'));
    }
    return toISODateString(selectedDate.add(3, 'day'));
  }

  private calculateDateFrom(selectedDate: Dayjs, eligibleFromDate?: string): string {
    const startOfWeek = selectedDate.startOf('isoWeek');
    const today = dayjs().tz().startOf('day');
    const dayAfterTomorrow = today.add(2, 'day');
    let earliestAvailableDate = dayjs.max(startOfWeek, dayAfterTomorrow);
    if (eligibleFromDate) {
      earliestAvailableDate = dayjs.max(earliestAvailableDate, dayjs(eligibleFromDate).tz());
    }
    return toISODateString(earliestAvailableDate);
  }

  private calculateDateTo(selectedDate: Dayjs, eligibleToDate?: string): string {
    const endOfWeek = selectedDate.endOf('isoWeek');
    const today = dayjs().tz().startOf('day');
    const todayPlusSixMonths = today.add(6, 'month').subtract(1, 'day');
    let latestAvailableDate = dayjs.min(endOfWeek, todayPlusSixMonths);
    if (eligibleToDate) {
      latestAvailableDate = dayjs.min(latestAvailableDate, dayjs(eligibleToDate).tz());
    }
    return toISODateString(latestAvailableDate);
  }

  private groupSlotsByDate(slots: AppointmentSlot[], dateFrom: string, dateTo: string): Record<string, AppointmentSlot[]> {
    const slotsByDate: Record<string, AppointmentSlot[]> = {};
    let currentDate = dayjs.tz(dateFrom);
    while (!currentDate.isAfter(dayjs(dateTo).tz(), 'date')) {
      const currentDateIsoString = toISODateString(currentDate);
      const slotsOnDate = slots.filter((slot) => toISODateString(slot.startDateTime) === currentDateIsoString);
      // eslint-disable-next-line security/detect-object-injection
      slotsByDate[currentDateIsoString] = slotsOnDate;
      currentDate = currentDate.add(1, 'day');
    }
    return slotsByDate;
  }

  private getKpiIdentifiers(slots: AppointmentSlot[], preferredDate?: string): KPIIdentifiers | undefined {
    let kpiIdentifiers: KPIIdentifiers | undefined;
    if (preferredDate && slots && slots[0]) {
      kpiIdentifiers = {
        dateAvailableOnOrBeforePreferredDate: slots[0].dateAvailableOnOrBeforePreferredDate,
        dateAvailableOnOrAfterPreferredDate: slots[0].dateAvailableOnOrAfterPreferredDate,
        dateAvailableOnOrAfterToday: slots[0].dateAvailableOnOrAfterToday,
      };
    }
    return kpiIdentifiers;
  }

  private getDatesBetween(startDate: Dayjs, endDate: Dayjs): Dayjs[] {
    let currentDate = startDate;
    const dates: Dayjs[] = [];
    while (currentDate.isBefore(endDate)) {
      dates.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    return dates;
  }
}
