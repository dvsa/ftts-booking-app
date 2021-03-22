import { LicenceNumber } from '../../domain/licence-number';
import { Licence } from './licence';

export interface Dvla {
  getDriverDetails(dln: LicenceNumber): Promise<Licence>;
}
