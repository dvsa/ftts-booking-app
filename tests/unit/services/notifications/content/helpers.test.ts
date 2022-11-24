import { SupportType } from '../../../../../src/domain/enums';
import { Centre } from '../../../../../src/domain/types';
import { formatAddressLines, escapeNotifyMarkdown, formatSupportTypes } from '../../../../../src/services/notifications/content/helpers';

jest.mock('../../../../../src/helpers/language', () => ({
  translate: (key: string): string => {
    if (key.includes('voiceover')) return 'Voiceover translated';
    if (key.includes('extraTime')) return 'Extra time translated';
    if (key.includes('other')) return 'Other translated';
    return 'Not found';
  },
}));

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

  describe('formatSupportTypes', () => {
    test('given an array of SupportTypes returns a string of line-separated translated abbreviations', () => {
      const supportTypes = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];

      const result = formatSupportTypes(supportTypes);

      expect(result).toBe('Voiceover translated, Extra time translated, Other translated');
    });
  });

  describe('escapeNotifyMarkdown', () => {
    test('escapes gov notify markdown syntax in user input', () => {
      const input = '# I am a title\n* I am a bullet with another #\n--- This was a line break\n^ This is inset text!\n$ This is not markdown';

      const output = escapeNotifyMarkdown(input);

      expect(output).toBe('\\\\# I am a title\n\\\\* I am a bullet with another \\\\#\n\\\\--- This was a line break\n\\\\^ This is inset text!\n$ This is not markdown');
    });
  });
});
