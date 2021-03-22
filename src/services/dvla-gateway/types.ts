export interface DvlaDriverData {
  message: string;
  driver: Driver;
  licence: DvlaLicence;
}

export interface Driver {
  givenName: string;
  surname: string;
  dateOfBirth: string;
  address: DvlaAddress;
}

export interface DvlaLicence {
  status: string;
  entitlements: DvlaEntitlement[];
}

export interface DvlaEntitlement {
  code: string;
  validFrom: string;
  validTo: string;
  type: string;
}

export interface DvlaAddress {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
}

export enum EntitlementType {
  Provisional = 'P',
  Full = 'F',
  UnclaimedTestPass = 'U',
}
