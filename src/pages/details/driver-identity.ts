import { LicenceNumber } from '../../domain/licence-number';
import { UtcDate } from '../../domain/utc-date';
import { DvlaAddress } from '../../services/dvla-gateway/types';

export class DriverIdentity {
  constructor(
    public readonly dln: LicenceNumber,
    public readonly firstnames: string,
    public readonly surname: string,
    public readonly birthDate: UtcDate,
    public readonly address: DvlaAddress,
  ) {}

  public equals(other: DriverIdentity): boolean {
    return this.dln.equals(other.dln)
      && this.firstnames.toUpperCase() === other.firstnames.toUpperCase()
      && this.surname.toUpperCase() === other.surname.toUpperCase()
      && this.birthDate.equals(other.birthDate);
  }
}
