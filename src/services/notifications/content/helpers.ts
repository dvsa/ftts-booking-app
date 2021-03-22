import { Centre } from '../../../domain/types';

export const formatAddressLines = (centre: Centre): string => {
  const addressFields = [centre.name, centre.addressLine1, centre.addressLine2, centre.addressCity, centre.addressPostalCode];
  return addressFields
    .filter(Boolean) // Skip if empty/null
    .join('\n');
};
