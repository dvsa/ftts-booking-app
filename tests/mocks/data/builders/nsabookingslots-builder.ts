import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { CRMNsaBookingSlots } from '../../../../src/services/crm-gateway/interfaces';
import { CRMNsaBookingSlotStatus } from '../../../../src/services/crm-gateway/enums';

export const nsaBookingSlotsBuilder = (): CRMNsaBookingSlots => (build<CRMNsaBookingSlots>({
  fields: {
    _ftts_bookingid_value: faker.datatype.uuid(),
    ftts_status: CRMNsaBookingSlotStatus.Offered,
    ftts_reservationid: faker.datatype.uuid(),
    ftts_expirydate: faker.date.future().toISOString().split('T')[0],
    _ftts_organisationid_value: faker.datatype.uuid(),
    ftts_testdate: faker.date.future().toISOString().split('T')[0],
  },
}))();
