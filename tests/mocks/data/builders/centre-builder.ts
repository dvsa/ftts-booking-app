import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { Centre } from '../../../../src/domain/types';
import { TCNRegion } from '../../../../src/domain/enums';
import { CRMRemit } from '../../../../src/services/crm-gateway/enums';
import { BookingDetailsCentre, CRMTestCentre } from '../../../../src/services/crm-gateway/interfaces';

export const centreBuilder = (): Centre => (build<Centre>({
  fields: {
    testCentreId: faker.datatype.uuid(),
    name: faker.company.name(),
    parentOrganisation: faker.company.name(),
    status: faker.random.alpha(),
    region: faker.helpers.arrayElement([TCNRegion.A, TCNRegion.B, TCNRegion.C]),
    state: faker.address.county(),
    siteId: faker.datatype.uuid(),
    description: faker.lorem.lines(2),
    accessible: faker.random.alpha(),
    fullyAccessible: true,
    addressLine1: faker.address.secondaryAddress(),
    addressLine2: faker.address.streetAddress(),
    addressCity: faker.address.cityName(),
    addressCounty: faker.address.county(),
    addressPostalCode: `${faker.address.countryCode('alpha-3')} ${faker.address.countryCode('alpha-3')}`,
    addressCountryRegion: faker.helpers.arrayElement(['England', 'Wales', 'Scotland', 'Northern Ireland']),
    latitude: Number(faker.random.numeric()),
    longitude: Number(faker.random.numeric()),
    distance: Number(faker.random.numeric()),
    accountId: faker.datatype.uuid(),
    remit: Number(faker.random.numeric()),
    ftts_tcntestcentreid: faker.datatype.uuid(),
  },
}))();

export const bookingDetailsCentreBuilder = (): BookingDetailsCentre => (build<BookingDetailsCentre>({
  fields: {
    testCentreId: faker.datatype.uuid(),
    name: faker.company.name(),
    addressLine1: faker.address.secondaryAddress(),
    addressLine2: faker.address.streetAddress(),
    addressCity: faker.address.cityName(),
    addressCounty: faker.address.county(),
    addressPostalCode: `${faker.address.countryCode('alpha-3')} ${faker.address.countryCode('alpha-3')}`,
    remit: CRMRemit.England,
    accountId: faker.datatype.uuid(),
    region: faker.helpers.arrayElement([TCNRegion.A, TCNRegion.B, TCNRegion.C]),
    siteId: faker.datatype.uuid(),
    ftts_tcntestcentreid: faker.datatype.uuid(),
  },
}))();

export const crmTestCentreBuilder = (): CRMTestCentre => (build<CRMTestCentre>({
  fields: {
    ftts_siteid: faker.datatype.uuid(),
    name: faker.company.name(),
    address1_line1: faker.address.secondaryAddress(),
    address1_line2: faker.address.streetAddress(),
    address1_city: faker.address.cityName(),
    address1_county: faker.address.county(),
    address1_postalcode: `${faker.address.countryCode('alpha-3')} ${faker.address.countryCode('alpha-3')}`,
    ftts_remit: CRMRemit.England,
    accountid: faker.datatype.uuid(),
    ftts_tcntestcentreid: faker.datatype.uuid(),
    parentaccountid: {
      ftts_regiona: true,
      ftts_regionb: false,
      ftts_regionc: false,
    },
  },
}))();
