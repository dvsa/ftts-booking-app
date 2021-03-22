import { LOCALE, TARGET } from '../../../../../src/domain/enums';
import { buildBookingConfirmationEmailContent } from '../../../../../src/services/notifications/content/builders';

type MockDetails = { placeholder1: string; placeholder2: string };

jest.mock('../../../../../src/services/notifications/content', () => ({
  email: {
    0: { // Booking confirmation
      gb: {
        subject: 'GB booking confirmation subject',
        buildBody: (mockDetails: MockDetails) => `GB booking confirmation body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY booking confirmation subject',
        buildBody: (mockDetails: MockDetails) => `CY booking confirmation body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI booking confirmation subject',
        buildBody: (mockDetails: MockDetails) => `NI booking confirmation body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
    },
  },
}));

describe('Notifications content builders', () => {
  describe('buildBookingConfirmationEmailContent', () => {
    const mockDetails: MockDetails = {
      placeholder1: 'placeholder1Value',
      placeholder2: 'placeholder2Value',
    };

    test('builds GB email content with placeholder values given GB target', () => {
      const mockTarget = TARGET.GB;
      const mockLang = LOCALE.GB;

      const content = buildBookingConfirmationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'GB booking confirmation subject',
        body: 'GB booking confirmation body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds CY email content with placeholder values given CY lang', () => {
      const mockTarget = TARGET.GB;
      const mockLang = LOCALE.CY;

      const content = buildBookingConfirmationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'CY booking confirmation subject',
        body: 'CY booking confirmation body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds NI email content with placeholder values given NI target', () => {
      const mockTarget = TARGET.NI;

      const content = buildBookingConfirmationEmailContent(mockDetails as any, mockTarget, undefined);

      expect(content).toStrictEqual({
        subject: 'NI booking confirmation subject',
        body: 'NI booking confirmation body with placeholder1Value and placeholder2Value',
      });
    });
  });
});
