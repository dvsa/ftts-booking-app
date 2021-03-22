export interface Slot {
  slotId: string;
  providerBookingId: number;
  testCentreId: string;
  testDateTime: string;
  reservedUntil?: string;
  candidateId?: string;
}

export interface AppointmentSlot {
  quantity: number;
  startDateTime: string;
  testCentreId: string;
  testTypes: string[];
  displayTime?: string;
  isMorning?: boolean;
}

export class Slots {
  constructor(private readonly slots: Slot[]) { }

  public afternoonSlots(): Slot[] {
    const getAfternoonSlots = (slot: Slot): boolean => new Date(slot.testDateTime).getHours() >= 12;
    return this.slots.filter(getAfternoonSlots);
  }

  public distinctDates(): string[] {
    const removeTime = (slot: Slot): string => slot.testDateTime.split('T')[0];
    return [...new Set(this.slots.map(removeTime).sort())];
  }

  public morningSlots(): Slot[] {
    const getMorningSlots = (slot: Slot): boolean => new Date(slot.testDateTime).getHours() < 12;
    return this.slots.filter(getMorningSlots);
  }
}
