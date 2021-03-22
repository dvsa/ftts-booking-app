import { BirthDay } from '../../pages/details/birth-day';
import { Details } from '../../pages/details/types';
import { DriverIdentity } from '../../pages/details/driver-identity';
import { Dvla } from '../../pages/details/dvla';
import { Licence } from '../../pages/details/licence';
import { TheoryTest } from '../../pages/details/theory-test';
import { TheoryTests } from '../../pages/details/theory-tests';
import { LicenceNumber } from '../licence-number';
import IncorrectCandidateDetails from './incorrect-candidate-details-error';
import { TARGET } from '../enums';

export class Candidate {
  public static async fromUserDetails(details: Details, dvla: Dvla, target: TARGET): Promise<Candidate> {
    const dln = LicenceNumber.of(details.licenceNumber, target);
    const licence = await dvla.getDriverDetails(LicenceNumber.of(details.licenceNumber, target));
    const driver = new DriverIdentity(dln, details.firstnames, details.surname, BirthDay.of(details).toDate(), licence.address);
    if (!licence.heldBy(driver)) {
      throw new IncorrectCandidateDetails('Couldn\'t find a match in the system, please verify your details are correct');
    }
    return new Candidate(licence);
  }

  public constructor(
    public readonly licence: Licence,
  ) { }

  public async availableTests(): Promise<TheoryTests> {
    const car: TheoryTest = TheoryTest.of('Car');
    const motorcycle: TheoryTest = TheoryTest.of('Motorcycle');

    return Promise.resolve(new TheoryTests([car, motorcycle]));
  }
}
