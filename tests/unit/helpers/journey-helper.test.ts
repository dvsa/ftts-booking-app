import { getJourneyName } from '../../../src/helpers/journey-helper';
import { Journey } from '../../../src/services/session';

describe('journey-helper', () => {
  describe('getJourneyName', () => {
    test.each([
      ['reschedule', { inManageBookingMode: true } as Journey],
      ['sa-instructor', { inManageBookingMode: false, isInstructor: true, standardAccommodation: true } as Journey],
      ['nsa-instructor', { inManageBookingMode: false, isInstructor: true, standardAccommodation: false } as Journey],
      ['sa', { inManageBookingMode: false, isInstructor: false, standardAccommodation: true } as Journey],
      ['nsa', { inManageBookingMode: false, isInstructor: false, standardAccommodation: false } as Journey],
    ])('for given journey returns %s', (expectedName: string, journey: Journey) => {
      expect(getJourneyName(journey)).toEqual(expectedName);
    });
  });
});
