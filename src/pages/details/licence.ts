import { LicenceNumber } from '../../domain/licence-number';
import { UtcDate } from '../../domain/utc-date';
import { DvlaAddress } from '../../services/dvla-gateway/types';
import { DriverIdentity } from './driver-identity';
import { Entitlements } from './entitlements';

export class Licence {
  public licenceId?: string;

  constructor(
    public readonly num: LicenceNumber,
    public readonly firstnames: string,
    public readonly surname: string,
    public readonly birthDate: UtcDate,
    public readonly entitlements: Entitlements,
    public readonly address: DvlaAddress,
  ) {
  }

  public doesNotInclude(entitlements: Entitlements): boolean {
    return !this.entitlements.intersects(entitlements);
  }

  public heldBy(driver: DriverIdentity): boolean {
    return this.num.equals(driver.dln)
      && this.firstnames.toUpperCase() === driver.firstnames.toUpperCase()
      && this.surname.toUpperCase() === driver.surname.toUpperCase()
      && this.birthDate.equals(driver.birthDate);
  }
}
