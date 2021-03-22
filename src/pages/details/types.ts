export interface Details extends Dob {
  firstnames: string;
  surname: string;
  licenceNumber: string;
}

export interface Dob {
  dobDay: string;
  dobMonth: string;
  dobYear: string;
}
