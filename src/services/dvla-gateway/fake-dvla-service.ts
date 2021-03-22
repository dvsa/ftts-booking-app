import { LicenceNumber } from '../../domain/licence-number';
import { DvlaAddress, DvlaDriverData, DvlaLicence } from './types';

interface FakeDriver {
  dln: string;
  givenName: string;
  surname: string;
  dateOfBirth: string;
  licence: DvlaLicence;
  address: DvlaAddress;
}

enum LicenceStatus {
  CurrentProvisional = 'PC',
  CurrentFull = 'FC',
  ExpiredProvisional = 'PE',
  ExpiredFull = 'FE',
}

enum EntitlementType {
  Provisional = 'P',
  Full = 'F',
  UnclaimedTestPass = 'U',
}

// As specified on https://www.gov.uk/driving-licence-categories
enum EntitlementCode {
  Moped = 'AM',
  LightMotorbike = 'A1',
  Motorbike = 'A2',
  AllMotorbikes = 'A',
  Car = 'B',
  CarAutomatic = 'B auto',
}

class FakeDvlaService {
  public getDriverDetails(dln: LicenceNumber): DvlaDriverData | undefined {
    const fakeDriver: FakeDriver | undefined = this.fakeDriverData.find((driver: FakeDriver) => driver.dln === dln.toString());

    if (fakeDriver) {
      return {
        message: 'Success',
        driver: {
          givenName: fakeDriver.givenName,
          surname: fakeDriver.surname,
          dateOfBirth: fakeDriver.dateOfBirth,
          address: fakeDriver.address,
        },
        licence: fakeDriver.licence,
      };
    }

    return undefined;
  }

  // tslint:disable-next-line:member-ordering
  private fakeDriverData: FakeDriver[] = [
    {
      dln: 'JONES061102W97YT',
      givenName: 'Wendy',
      surname: 'Jones',
      dateOfBirth: '2002-11-10T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-12-21T00:00:00.000Z',
            validTo: '2072-11-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-12-21T00:00:00.000Z',
            validTo: '2072-11-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-12-21T00:00:00.000Z',
            validTo: '2072-11-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'WILLI912119D94LQ',
      givenName: 'David',
      surname: 'Williams',
      dateOfBirth: '1999-12-11T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2016-12-18T00:00:00.000Z',
            validTo: '2069-12-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-02-03T00:00:00.000Z',
            validTo: '2069-12-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2016-12-18T00:00:00.000Z',
            validTo: '2069-12-11T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'ISLIN812100M92PF',
      givenName: 'Mick',
      surname: 'Islington',
      dateOfBirth: '1980-12-10T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1999-12-06T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1999-12-06T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '2007-04-22T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '2009-05-17T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1999-12-06T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'ROBER807131LP6TX',
      givenName: 'Liam Patrick',
      surname: 'Roberts',
      dateOfBirth: '1981-07-13T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2009-07-15T00:00:00.000Z',
            validTo: '2051-06-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2009-07-15T00:00:00.000Z',
            validTo: '2051-06-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2009-07-15T00:00:00.000Z',
            validTo: '2051-06-13T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'AVILA760082T93DE',
      givenName: 'Tasneem',
      surname: 'Avila',
      dateOfBirth: '1972-10-08T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1996-06-25T00:00:00.000Z',
            validTo: '2042-09-08T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1996-06-25T00:00:00.000Z',
            validTo: '2042-09-08T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1996-06-25T00:00:00.000Z',
            validTo: '2042-09-08T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'COOK9060110HG7XX',
      givenName: 'Helga Guenter',
      surname: 'Cook',
      dateOfBirth: '2000-10-11T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-09-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-09-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-09-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'DELAN009020GW5IG',
      givenName: 'Glen William',
      surname: 'Delaney',
      dateOfBirth: '2000-09-02T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-08-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-08-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-08-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'BENTO603026A97BQ',
      givenName: 'Abdur-Rahman',
      surname: 'Benton',
      dateOfBirth: '1966-03-02T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1984-05-12T00:00:00.000Z',
            validTo: '2036-01-31T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1984-05-12T00:00:00.000Z',
            validTo: '2036-01-31T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1984-05-12T00:00:00.000Z',
            validTo: '2036-01-31T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'RAMSE653270G99JF',
      givenName: 'Georgia',
      surname: 'Ramsey',
      dateOfBirth: '1960-03-27T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'HOLME609137SJ6ZS',
      givenName: 'Steven James',
      surname: 'Holmes',
      dateOfBirth: '1967-09-13T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1985-11-23T00:00:00.000Z',
            validTo: '2037-08-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1985-11-23T00:00:00.000Z',
            validTo: '2037-08-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1985-11-23T00:00:00.000Z',
            validTo: '2037-08-13T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'MURIL907177D92JR',
      givenName: 'Dale',
      surname: 'Murillo',
      dateOfBirth: '1997-07-17T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2015-09-27T00:00:00.000Z',
            validTo: '2067-06-17T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2015-09-27T00:00:00.000Z',
            validTo: '2067-06-17T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2015-09-27T00:00:00.000Z',
            validTo: '2067-06-17T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'SAMUE852058CF4ID',
      givenName: 'Caroline Firth',
      surname: 'Samuels',
      dateOfBirth: '1988-02-05T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2006-04-17T00:00:00.000Z',
            validTo: '2058-01-05T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2006-04-17T00:00:00.000Z',
            validTo: '2058-01-05T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2006-04-17T00:00:00.000Z',
            validTo: '2058-01-05T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'CROSS957259TZ3AF',
      givenName: 'Tasmin Zahra',
      surname: 'Cross',
      dateOfBirth: '1999-07-25T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'SELEN054020H97XI',
      givenName: 'Henrietta',
      surname: 'Selenium',
      dateOfBirth: '2000-04-02T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-04-03T00:00:00.000Z',
            validTo: '2070-03-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-04-03T00:00:00.000Z',
            validTo: '2070-03-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-04-03T00:00:00.000Z',
            validTo: '2070-03-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: 'SELEN952012BA3ST',
      givenName: 'Britney Arlene',
      surname: 'Selenium',
      dateOfBirth: '1992-02-01T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2012-01-27T00:00:00.000Z',
            validTo: '2062-01-01T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2012-01-27T00:00:00.000Z',
            validTo: '2062-01-01T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2012-01-27T00:00:00.000Z',
            validTo: '2062-01-01T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'ANDER603112T96MM',
      givenName: 'Thomas',
      surname: 'Anderson',
      dateOfBirth: '1962-03-11T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'KINGK904313K99SK',
      givenName: 'Katherine',
      surname: 'King',
      dateOfBirth: '1993-03-23T00:00:00.000Z',
      address: {
        line1: '96 Wiliams Street',
        line2: 'Dorset',
        city: 'Manchester',
        postcode: 'M15 8DJ',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'DOYLE809214B93OC',
      givenName: 'Conrad',
      surname: 'Doyle',
      dateOfBirth: '2001-05-14T00:00:00.000Z',
      address: {
        line1: '104 James Street',
        line2: 'Malvern',
        city: 'New Castle',
        postcode: 'NE1 1DF',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'PARKE406104M93AJ',
      givenName: 'James',
      surname: 'Parker',
      dateOfBirth: '1975-03-01T00:00:00.000Z',
      address: {
        line1: '24 Wolverhampton Road',
        line2: 'Penkridge',
        city: 'Wolverhampton',
        postcode: 'ST19 5PP',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'DAWSO701246R97AL',
      givenName: 'Laurence',
      surname: 'Dawson',
      dateOfBirth: '1990-10-22T00:00:00.000Z',
      address: {
        line1: '42 Kendall Road',
        line2: 'Priorslee',
        city: 'Telford',
        postcode: 'MHJ 3G6',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'PADIL201177L95UJ',
      givenName: 'Julia',
      surname: 'Padilla',
      dateOfBirth: '1997-04-17T00:00:00.000Z',
      address: {
        line1: '36 Hartshill Road',
        line2: 'Oldpark',
        city: 'Telford',
        postcode: 'TF2 6AT',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: 'PREST910064N92EC',
      givenName: 'Celia',
      surname: 'Preston',
      dateOfBirth: '1982-06-24T00:00:00.000Z',
      address: {
        line1: '553 Park Row',
        line2: 'Brandon',
        city: 'Bristol',
        postcode: 'BS1 5LJ',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },

    // NI CANDIDATES
    {
      dln: '06159200',
      givenName: 'Wendy',
      surname: 'Jones',
      dateOfBirth: '2002-11-10T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-12-21T00:00:00.000Z',
            validTo: '2072-11-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-12-21T00:00:00.000Z',
            validTo: '2072-11-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-12-21T00:00:00.000Z',
            validTo: '2072-11-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '82324964',
      givenName: 'David',
      surname: 'Williams',
      dateOfBirth: '1999-12-11T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2016-12-18T00:00:00.000Z',
            validTo: '2069-12-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-02-03T00:00:00.000Z',
            validTo: '2069-12-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2016-12-18T00:00:00.000Z',
            validTo: '2069-12-11T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '97386910',
      givenName: 'Mick',
      surname: 'Islington',
      dateOfBirth: '1980-12-10T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1999-12-06T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1999-12-06T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '2007-04-22T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '2009-05-17T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1999-12-06T00:00:00.000Z',
            validTo: '2050-12-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: '77601305',
      givenName: 'Liam Patrick',
      surname: 'Roberts',
      dateOfBirth: '1981-07-13T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2009-07-15T00:00:00.000Z',
            validTo: '2051-06-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2009-07-15T00:00:00.000Z',
            validTo: '2051-06-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2009-07-15T00:00:00.000Z',
            validTo: '2051-06-13T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: '79255378',
      givenName: 'Tasneem',
      surname: 'Avila',
      dateOfBirth: '1972-10-08T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1996-06-25T00:00:00.000Z',
            validTo: '2042-09-08T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1996-06-25T00:00:00.000Z',
            validTo: '2042-09-08T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1996-06-25T00:00:00.000Z',
            validTo: '2042-09-08T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '35138286',
      givenName: 'Helga Guenter',
      surname: 'Cook',
      dateOfBirth: '2000-10-11T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-09-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-09-10T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-09-10T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: '17874131',
      givenName: 'Glen William',
      surname: 'Delaney',
      dateOfBirth: '2000-09-02T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-08-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-08-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-11-13T00:00:00.000Z',
            validTo: '2070-08-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '73333797',
      givenName: 'Abdur-Rahman',
      surname: 'Benton',
      dateOfBirth: '1966-03-02T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1984-05-12T00:00:00.000Z',
            validTo: '2036-01-31T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1984-05-12T00:00:00.000Z',
            validTo: '2036-01-31T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1984-05-12T00:00:00.000Z',
            validTo: '2036-01-31T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: '62272485',
      givenName: 'Georgia',
      surname: 'Ramsey',
      dateOfBirth: '1960-03-27T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1978-06-07T00:00:00.000Z',
            validTo: '2030-02-25T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '25004025',
      givenName: 'Steven James',
      surname: 'Holmes',
      dateOfBirth: '1967-09-13T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1985-11-23T00:00:00.000Z',
            validTo: '2037-08-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1985-11-23T00:00:00.000Z',
            validTo: '2037-08-13T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1985-11-23T00:00:00.000Z',
            validTo: '2037-08-13T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: '08705004',
      givenName: 'Dale',
      surname: 'Murillo',
      dateOfBirth: '1997-07-17T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2015-09-27T00:00:00.000Z',
            validTo: '2067-06-17T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2015-09-27T00:00:00.000Z',
            validTo: '2067-06-17T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2015-09-27T00:00:00.000Z',
            validTo: '2067-06-17T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '69062660',
      givenName: 'Caroline Firth',
      surname: 'Samuels',
      dateOfBirth: '1988-02-05T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2006-04-17T00:00:00.000Z',
            validTo: '2058-01-05T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2006-04-17T00:00:00.000Z',
            validTo: '2058-01-05T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2006-04-17T00:00:00.000Z',
            validTo: '2058-01-05T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '05803854',
      givenName: 'Tasmin Zahra',
      surname: 'Cross',
      dateOfBirth: '1999-07-25T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2017-10-04T00:00:00.000Z',
            validTo: '2069-06-24T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '82052624',
      givenName: 'Henrietta',
      surname: 'Selenium',
      dateOfBirth: '2000-04-02T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentProvisional,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2018-04-03T00:00:00.000Z',
            validTo: '2070-03-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2018-04-03T00:00:00.000Z',
            validTo: '2070-03-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2018-04-03T00:00:00.000Z',
            validTo: '2070-03-03T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
        ],
      },
    },
    {
      dln: '76339410',
      givenName: 'Britney Arlene',
      surname: 'Selenium',
      dateOfBirth: '1992-02-01T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '2012-01-27T00:00:00.000Z',
            validTo: '2062-01-01T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '2012-01-27T00:00:00.000Z',
            validTo: '2062-01-01T00:00:00.000Z',
            type: EntitlementType.Provisional,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '2012-01-27T00:00:00.000Z',
            validTo: '2062-01-01T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
    {
      dln: '84148914',
      givenName: 'Thomas',
      surname: 'Anderson',
      dateOfBirth: '1962-03-11T00:00:00.000Z',
      address: {
        line1: '22 Acacia Avenue',
        line2: 'Some Area',
        city: 'Birmingham',
        postcode: 'PO57 CDE',
      },
      licence: {
        status: LicenceStatus.CurrentFull,
        entitlements: [
          {
            code: EntitlementCode.Moped,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.LightMotorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Motorbike,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.AllMotorbikes,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
          {
            code: EntitlementCode.Car,
            validFrom: '1980-03-06T00:00:00.000Z',
            validTo: '2962-03-11T00:00:00.000Z',
            type: EntitlementType.Full,
          },
        ],
      },
    },
  ];
}

export default new FakeDvlaService();
