import { LicenceNumber } from '../../../../src/domain/licence-number';
import { UtcDate } from '../../../../src/domain/utc-date';
import { DriverIdentity } from '../../../../src/pages/details/driver-identity';
import { Entitlements } from '../../../../src/pages/details/entitlements';
import { Licence } from '../../../../src/pages/details/licence';
import {
  Driver,
  DvlaDriverData,
  DvlaEntitlement,
  DvlaLicence,
} from '../../../../src/services/dvla-gateway/types';
import { DvlaGateway, asLicence } from '../../../../src/services/dvla-gateway/dvla-gateway';

describe('DVLA gateway', () => {
  const b: DvlaEntitlement = {
    code: 'B',
    validFrom: '',
    validTo: '',
    type: 'P',
  };

  const bAuto: DvlaEntitlement = {
    code: 'B auto',
    validFrom: '',
    validTo: '',
    type: 'U',
  };

  const a: DvlaEntitlement = {
    code: 'A',
    validFrom: '',
    validTo: '',
    type: 'F',
  };

  const wendyDvlaLicence: DvlaLicence = {
    status: '',
    entitlements: [b, bAuto, a],
  };

  const wendyJones: Driver = {
    givenName: 'WENDY',
    surname: 'JONES',
    dateOfBirth: '10/11/2002',
  };

  const dvlaDriverData: DvlaDriverData = {
    message: '',
    driver: wendyJones,
    licence: wendyDvlaLicence,
  };

  const wendyJonesDln = LicenceNumber.of('JONES061102W97YT');

  const wendyJonesIdentity: DriverIdentity = new DriverIdentity(
    wendyJonesDln,
    wendyJones.givenName,
    wendyJones.surname,
    UtcDate.of(wendyJones.dateOfBirth),
  );

  test('asLicense to Booking App License ignoring provisional entitlements', () => {
    const licence: Licence = asLicence(wendyJonesDln, dvlaDriverData);
    expect(licence.doesNotInclude(Entitlements.of('B'))).toBe(true);
    expect(licence.doesNotInclude(Entitlements.of('B auto'))).toBe(false);
    expect(licence.doesNotInclude(Entitlements.of('A'))).toBe(false);
  });

  test('asLicence adds DLN to License', () => {
    const licence: Licence = asLicence(wendyJonesDln, dvlaDriverData);

    expect(licence.heldBy(wendyJonesIdentity)).toBe(true);
  });

  describe('class', () => {
    let instance;
    beforeEach(() => {
      instance = DvlaGateway.getInstance();
    });

    test('retrieving a licence', async () => {
      const licence: Licence = await instance.getDriverDetails(wendyJonesDln);

      expect(licence.num.toString()).toBe('JONES061102W97YT');
    });

    test('retrieving a licence handles a failure', async () => {
      instance = DvlaGateway.getInstance();
      const nonExistant = LicenceNumber.of('SMITH061102W97YT');

      await expect(instance.getDriverDetails(nonExistant)).rejects.toThrow();
    });
  });
});
