import { Candidate } from '../../../src/domain/candidate/candidate';
import IncorrectCandidateDetails from '../../../src/domain/candidate/incorrect-candidate-details-error';
import { LicenceNumber } from '../../../src/domain/licence-number';
import { UtcDate } from '../../../src/domain/utc-date';
import { Details } from '../../../src/pages/details/types';
import { Dvla } from '../../../src/pages/details/dvla';
import { Entitlements } from '../../../src/pages/details/entitlements';
import { Licence } from '../../../src/pages/details/licence';
import { TARGET } from '../../../src/domain/enums';

class DvlaStub implements Dvla {
  constructor(private readonly licence: Licence) {}

  public getDriverDetails(): Promise<Licence> {
    return new Promise((resolve) => resolve(this.licence));
  }
}

function wendyJonesWith(entitlements: Entitlements): Licence {
  return new Licence(
    LicenceNumber.of('JONES061102W97YT', TARGET.GB),
    'WENDY',
    'JONES',
    UtcDate.of('2002-11-10'),
    entitlements,
  );
}

jest.mock('axios');
jest.mock('../../../src/services/crm-gateway/crm-gateway', () => ({
  CRMGateway: {
    getInstance: () => ({
      getLicenceByLicenceNumber: jest.fn(),
    }),
  },
}));

describe('Candidate', () => {
  let dvla: Dvla;
  let details: Details;
  beforeEach(() => {
    dvla = new DvlaStub(wendyJonesWith(Entitlements.of('AM,A1,B')));

    details = {
      firstnames: 'Wendy',
      surname: 'Jones',
      licenceNumber: 'JONES061102W97YT',
      dobDay: '10',
      dobMonth: '11',
      dobYear: '2002',
    };
  });

  test('can be created given user details + gateway', () => {
    expect(() => Candidate.fromUserDetails(details, dvla, TARGET.GB)).not.toThrow();
  });

  describe('Available tests', () => {
    test('is empty when driver has known entitlements', async () => {
      const candidate = await Candidate.fromUserDetails(details, dvla, TARGET.GB);

      const available = await candidate.availableTests();

      expect(available.get().length).toBe(2);
    });
  });

  describe('Driver record not matching user input', () => {
    test('firstnames mismatch', async () => {
      details.firstnames = 'jack';

      try {
        await Candidate.fromUserDetails(details, dvla, TARGET.GB);
        expect(false).toBe(true);
      } catch (e) {
        expect(e instanceof IncorrectCandidateDetails).toBeTruthy();
      }
    });

    test('surname mismatch', async () => {
      details.surname = 'james';

      try {
        await Candidate.fromUserDetails(details, dvla, TARGET.GB);
        expect(false).toBe(true);
      } catch (e) {
        expect(e instanceof IncorrectCandidateDetails).toBeTruthy();
      }
    });

    test('Birthdate mismatch', async () => {
      details.dobDay = '11';

      try {
        await Candidate.fromUserDetails(details, dvla, TARGET.GB);
        expect(false).toBe(true);
      } catch (e) {
        expect(e instanceof IncorrectCandidateDetails).toBeTruthy();
      }
    });
  });
});
