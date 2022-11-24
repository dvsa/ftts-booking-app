import { Centre } from '../../../domain/types';
import { SupportType } from '../../../domain/enums';
import { translate } from '../../../helpers/language';

export const formatAddressLines = (centre: Centre): string => {
  const addressFields = [centre.name, centre.addressLine1, centre.addressLine2, centre.addressCity, centre.addressPostalCode];
  return addressFields
    .filter(Boolean) // Skip if empty/null
    .join('\n');
};

export const formatSupportTypes = (supportTypes: SupportType[]): string => {
  const translated = supportTypes.map((type) => translate(`generalContent.abbreviatedSupportTypes.${type}`));
  return translated.join(', ');
};

// Regex to match gov notify markdown syntax #,*,^,--- in user input and escape with backslash
export const escapeNotifyMarkdown = (input: string): string => input.replace(/#|\*|\^|---/g, '\\\\$&');
