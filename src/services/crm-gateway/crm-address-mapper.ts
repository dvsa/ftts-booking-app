import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { CRMContact } from './interfaces';

export type CRMContactAddress = Partial<Pick<CRMContact, 'address1_line1' | 'address1_line2' | 'address1_line3' | 'ftts_address1_line4' | 'address1_city' | 'address1_postalcode'>>;

/**
 * For DVSA candidates (address with 5 lines) map line 5 to the CRM city key.
 * For DVA (address with 3 lines) and incomplete DVSA addresses (fewer than 5 lines) - map the last populated line to the CRM city key.
 * Should only the mandatory lines be populated (line 1 and postcode) then the postcode is taken as the CRM city key.
 * @param address The elgibility address object
 * @returns a partial CRM contact entry containing only the address fields (lines 1-4), city and postcode
 */
export function mapToCrmContactAddress(address: ELIG.Address | undefined): CRMContactAddress {
  if (address) {
    const mandatoryKeys = ['line1', 'postcode'];
    const populatedNonMandatoryKeys = Object.keys(address).filter((key) => !mandatoryKeys.includes(key) && Boolean(address[key as keyof ELIG.Address]));
    const lastPopulatedKey = populatedNonMandatoryKeys[populatedNonMandatoryKeys.length - 1];
    if (lastPopulatedKey) {
      const newAddress = { ...address };
      delete newAddress[lastPopulatedKey as keyof ELIG.Address];

      return {
        address1_line1: newAddress?.line1,
        address1_line2: newAddress?.line2,
        address1_line3: newAddress?.line3,
        ftts_address1_line4: newAddress?.line4,
        address1_city: address[lastPopulatedKey as keyof ELIG.Address],
        address1_postalcode: newAddress?.postcode,
      };
    }
  }
  return {
    address1_line1: address?.line1,
    address1_line2: address?.line2,
    address1_line3: address?.line3,
    ftts_address1_line4: address?.line4,
    address1_city: address?.postcode,
    address1_postalcode: address?.postcode,
  };
}
