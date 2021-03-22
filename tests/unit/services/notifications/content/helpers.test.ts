import { Centre } from '../../../../../src/domain/types';
import { formatAddressLines } from '../../../../../src/services/notifications/content/helpers';

describe('Notifications content helpers', () => {
  describe('formatAddressLines', () => {
    test('given a Centre returns a string of its address lines', () => {
      const centre: Partial<Centre> = {
        name: 'name',
        addressLine1: 'addressLine1',
        addressLine2: 'addressLine2',
        addressCity: 'addressCity',
        addressPostalCode: 'addressPostalCode',
      };

      const addressLines = formatAddressLines(centre as any);

      expect(addressLines).toBe('name\naddressLine1\naddressLine2\naddressCity\naddressPostalCode');
    });

    test('skips empty/undefined/null address fields', () => {
      const centre: Partial<Centre> = {
        name: 'name',
        addressLine1: 'addressLine1',
        addressLine2: '',
        addressCity: null,
        addressPostalCode: 'addressPostalCode',
      };

      const addressLines = formatAddressLines(centre as any);

      expect(addressLines).toBe('name\naddressLine1\naddressPostalCode');
    });
  });
});
