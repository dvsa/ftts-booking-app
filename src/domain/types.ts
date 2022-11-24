import { CRMEvidenceStatus } from '../services/crm-gateway/enums';
import { SupportType, TCNRegion, TestType } from './enums';

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
  ftts_tcntestcentreid?: string;
}

export interface CentreResponse {
  status: number;
  testCentres: Centre[];
}

export interface Eligibility {
  eligible: boolean;
  testType: TestType;
  eligibleFrom?: string; // YYYY-MM-DD
  eligibleTo?: string; // YYYY-MM-DD
  reasonForIneligibility?: string;
  personalReferenceNumber?: string;
  paymentReceiptNumber?: string;
}

export interface PriceListItem {
  testType: TestType;
  price: number;
  product: {
    productId: string;
    parentId: string;
    name: string;
  };
}

export type SupportTypeOption = {
  attributes: {
    'data-automation-id': string;
  };
  checked: boolean;
  text: string;
  value: SupportType;
};
export interface SupportNeed {
  evidenceStatus: CRMEvidenceStatus;
  name: string;
}
