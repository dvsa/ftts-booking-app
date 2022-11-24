export interface AppointmentSlot extends KPIIdentifiers {
  quantity: number;
  startDateTime: string;
  testCentreId: string;
  testTypes: string[];
}

export interface KPIIdentifiers {
  dateAvailableOnOrAfterToday?: string;
  dateAvailableOnOrBeforePreferredDate?: string;
  dateAvailableOnOrAfterPreferredDate?: string;
}
