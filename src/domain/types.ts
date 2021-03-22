import { TCNRegion } from './enums';

export interface Centre {
  testCentreId?: string;
  name: string;
  parentOrganisation: string;
  status: string;
  region: TCNRegion;
  state: string;
  siteId: string;
  description: string;
  accessible?: string;
  fullyAccessible: boolean;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressCounty: string;
  addressPostalCode: string;
  addressCountryRegion: string;
  latitude: number;
  longitude: number;
  distance: number;
  accountId: string;
  remit: number;
}

export interface CentreResponse {
  status: number;
  testCentres: Centre[];
}
