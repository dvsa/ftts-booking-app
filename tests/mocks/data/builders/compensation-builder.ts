import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { CompensatedBooking } from '../../../../src/services/crm-gateway/interfaces';
import { CRMBookingStatus, CRMProductNumber } from '../../../../src/services/crm-gateway/enums';

export const compensationBookingBuilder = (): CompensatedBooking => (build<CompensatedBooking>({
  fields: {
    bookingProductId: faker.datatype.uuid(),
    bookingProductReference: faker.random.alphaNumeric(10),
    bookingId: faker.datatype.uuid(),
    bookingStatus: CRMBookingStatus.Reserved,
    candidateId: faker.datatype.uuid(),
    compensationAssigned: faker.helpers.arrayElement(['Yes', 'No']),
    compensationRecognised: faker.helpers.arrayElement(['Yes', 'No']),
    productNumber: CRMProductNumber.CAR,
    pricePaid: faker.datatype.number({ min: 25, max: 50 }),
    price: faker.datatype.number({ min: 25, max: 50 }),
    priceListId: faker.datatype.uuid(),
  },
}))();
