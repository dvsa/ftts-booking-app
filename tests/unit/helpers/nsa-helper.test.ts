import { isNsaDraftBooking } from '../../../src/helpers';
import { CRMBookingDetails } from '../../../src/services/crm-gateway/interfaces';
import { CRMBookingStatus } from '../../../src/services/crm-gateway/enums';

describe('nsa-helper', () => {
  describe('isNsaDraft', () => {
    let crmBookingDetails: Partial<CRMBookingDetails>;
    beforeEach(() => {
      crmBookingDetails = {
        ftts_bookingstatus: CRMBookingStatus.Draft,
        ftts_bookingid: {
          ftts_nonstandardaccommodation: true,
        } as CRMBookingDetails['ftts_bookingid'],
      };
    });

    test('The correct CRMBookingStatus, NonStandardAccomodation is true and it returns true', () => {
      expect(isNsaDraftBooking(crmBookingDetails as CRMBookingDetails)).toBe(true);
    });

    test('The incorrect CRMBookingStatus, NonStandardAccomodation is true and it returns false', () => {
      crmBookingDetails.ftts_bookingstatus = CRMBookingStatus.Cancelled;

      expect(isNsaDraftBooking(crmBookingDetails as CRMBookingDetails)).toBe(false);
    });

    test('The correct CRMBookingStatus, NonStandardAccomodation is false and it returns false', () => {
      (crmBookingDetails.ftts_bookingid as CRMBookingDetails['ftts_bookingid']).ftts_nonstandardaccommodation = false;

      expect(isNsaDraftBooking(crmBookingDetails as CRMBookingDetails)).toBe(false);
    });

    test('The incorrect CRMBookingStatus, NonStandardAccomodation is false and it returns false', () => {
      crmBookingDetails.ftts_bookingstatus = CRMBookingStatus.Cancelled;
      (crmBookingDetails.ftts_bookingid as CRMBookingDetails['ftts_bookingid']).ftts_nonstandardaccommodation = false;

      expect(isNsaDraftBooking(crmBookingDetails as CRMBookingDetails)).toBe(false);
    });
  });
});
