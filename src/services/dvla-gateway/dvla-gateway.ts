import axios, { AxiosRequestConfig } from 'axios';
import config from '../../config';
import { LicenceNumber } from '../../domain/licence-number';
import { UtcDate } from '../../domain/utc-date';
import { Dvla } from '../../pages/details/dvla';
import { Entitlements } from '../../pages/details/entitlements';
import { Licence } from '../../pages/details/licence';
import DvlaError from './dvla-error';
import FakeDvlaService from './fake-dvla-service';
import { DvlaEntitlement, EntitlementType, DvlaDriverData } from './types';

export class DvlaGateway implements Dvla {
  public static getInstance(): Dvla {
    if (!DvlaGateway.instance) {
      DvlaGateway.instance = new DvlaGateway();
    }
    return DvlaGateway.instance;
  }

  private static instance: Dvla;

  public async getDriverDetails(dln: LicenceNumber): Promise<Licence> {
    try {
      return await this.tryGetDriverDetails(dln);
    } catch (e) {
      // return the message for the status codes defined in the ADD API
      if (e.response && e.response.status === 321) {
        throw new DvlaError('Invalid driving licence number');
      }
      if (e.response && e.response.status === 400) {
        throw new DvlaError('Couldn\'t find a match in the system, please verify your details are correct');
      }

      throw e;
    }
  }

  // Temp stub code - ignore eslint naming error
  // eslint-disable-next-line @typescript-eslint/camelcase
  private async tryGetDriverDetails___TEMP(dln: LicenceNumber): Promise<Licence> {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: config.dvlaAccessToken,
      },
    };
    const response = await axios.get(`${config.dvlaUrl}/${dln.toString()}`, requestConfig);
    return asLicence(dln, response.data);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async tryGetDriverDetails(dln: LicenceNumber): Promise<Licence> {
    const driverDetails = FakeDvlaService.getDriverDetails(dln);

    if (driverDetails) {
      return asLicence(dln, driverDetails);
    }
    throw new DvlaError('Bad request - driving licence not present in the mock data store');
  }
}

const toCode = (e: DvlaEntitlement): string => e.code;
const notProvisional = (e: DvlaEntitlement): boolean => e.type !== EntitlementType.Provisional;

function nonProvisionalEntitlementsFrom(dvlaDriverData: DvlaDriverData): Entitlements {
  const entitlements = dvlaDriverData.licence.entitlements
    .filter(notProvisional)
    .map(toCode)
    .join(',');
  return Entitlements.of(entitlements);
}

export function asLicence(dln: LicenceNumber, dvlaDriverData: DvlaDriverData): Licence {
  return new Licence(
    dln,
    dvlaDriverData.driver.givenName,
    dvlaDriverData.driver.surname,
    UtcDate.of(dvlaDriverData.driver.dateOfBirth),
    nonProvisionalEntitlementsFrom(dvlaDriverData),
    dvlaDriverData.driver.address,
  );
}
