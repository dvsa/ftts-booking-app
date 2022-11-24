import { Locale, Target } from '../../../../../src/domain/enums';
import {
  buildBookingCancellationEmailContent, buildBookingConfirmationEmailContent,
  buildBookingRescheduledEmailContent, buildRefundRequestEmailContent, buildSupportRequestDetails, buildReturningCandidateEmailContent,
} from '../../../../../src/services/notifications/content/builders';
import { mockSessionBooking } from '../../../../mocks/data/session-types';

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
    1: { // Booking cancellation
      gb: {
        subject: 'GB booking cancellation subject',
        buildBody: (mockDetails: MockDetails) => `GB booking cancellation body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY booking cancellation subject',
        buildBody: (mockDetails: MockDetails) => `CY booking cancellation body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI booking cancellation subject',
        buildBody: (mockDetails: MockDetails) => `NI booking cancellation body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
    },
    2: { // Booking rescheduled
      gb: {
        subject: 'GB booking rescheduled subject',
        buildBody: (mockDetails: MockDetails) => `GB booking rescheduled body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY booking rescheduled subject',
        buildBody: (mockDetails: MockDetails) => `CY booking rescheduled body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI booking rescheduled subject',
        buildBody: (mockDetails: MockDetails) => `NI booking rescheduled body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
    },
    3: { // Evidence required
      gb: {
        subject: 'GB evidence required subject',
        buildBody: (mockDetails: MockDetails) => `GB evidence required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY evidence required subject',
        buildBody: (mockDetails: MockDetails) => `CY evidence required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI evidence required subject',
        buildBody: (mockDetails: MockDetails) => `NI evidence required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
    },
    4: { // Evidence not required
      gb: {
        subject: 'GB evidence not required subject',
        buildBody: (mockDetails: MockDetails) => `GB evidence not required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY evidence not required subject',
        buildBody: (mockDetails: MockDetails) => `CY evidence not required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI evidence not required subject',
        buildBody: (mockDetails: MockDetails) => `NI evidence not required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
    },
    5: { // Evidence may be required
      gb: {
        subject: 'GB evidence may be required subject',
        buildBody: (mockDetails: MockDetails) => `GB evidence may be required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY evidence may be required subject',
        buildBody: (mockDetails: MockDetails) => `CY evidence may be required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI evidence may be required subject',
        buildBody: (mockDetails: MockDetails) => `NI evidence may be required body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
    },
    6: { // Support request
      gb: {
        subject: 'GB support request subject',
        buildBody: (mockDetails: MockDetails) => `GB support request body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY support request subject',
        buildBody: (mockDetails: MockDetails) => `CY support request body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI support request subject',
        buildBody: (mockDetails: MockDetails) => `NI support request body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
    },
    7: { // Refund request
      gb: {
        subject: 'GB refund request subject',
        buildBody: (mockDetails: MockDetails) => `GB refund request body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      cy: {
        subject: 'CY refund request subject',
        buildBody: (mockDetails: MockDetails) => `CY refund request body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
      },
      ni: {
        subject: 'NI refund request subject',
        buildBody: (mockDetails: MockDetails) => `NI refund request body with ${mockDetails.placeholder1} and ${mockDetails.placeholder2}`,
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
      const mockTarget = Target.GB;
      const mockLang = Locale.GB;

      const content = buildBookingConfirmationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'GB booking confirmation subject',
        body: 'GB booking confirmation body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds CY email content with placeholder values given CY lang', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.CY;

      const content = buildBookingConfirmationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'CY booking confirmation subject',
        body: 'CY booking confirmation body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds NI email content with placeholder values given NI target', () => {
      const mockTarget = Target.NI;
      const mockLang = Locale.GB;

      const content = buildBookingConfirmationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'NI booking confirmation subject',
        body: 'NI booking confirmation body with placeholder1Value and placeholder2Value',
      });
    });
  });

  describe('buildBookingCancellationEmailContent', () => {
    const mockDetails: MockDetails = {
      placeholder1: 'placeholder1Value',
      placeholder2: 'placeholder2Value',
    };

    test('builds GB email content with placeholder values given GB target', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.GB;

      const content = buildBookingCancellationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'GB booking cancellation subject',
        body: 'GB booking cancellation body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds CY email content with placeholder values given CY lang', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.CY;

      const content = buildBookingCancellationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'CY booking cancellation subject',
        body: 'CY booking cancellation body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds NI email content with placeholder values given NI target', () => {
      const mockTarget = Target.NI;
      const mockLang = Locale.GB;

      const content = buildBookingCancellationEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'NI booking cancellation subject',
        body: 'NI booking cancellation body with placeholder1Value and placeholder2Value',
      });
    });
  });

  describe('buildBookingRescheduledEmailContent', () => {
    const mockDetails: MockDetails = {
      placeholder1: 'placeholder1Value',
      placeholder2: 'placeholder2Value',
    };

    test('builds GB email content with placeholder values given GB target', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.GB;

      const content = buildBookingRescheduledEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'GB booking rescheduled subject',
        body: 'GB booking rescheduled body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds CY email content with placeholder values given CY lang', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.CY;

      const content = buildBookingRescheduledEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'CY booking rescheduled subject',
        body: 'CY booking rescheduled body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds NI email content with placeholder values given NI target', () => {
      const mockTarget = Target.NI;
      const mockLang = Locale.GB;

      const content = buildBookingRescheduledEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'NI booking rescheduled subject',
        body: 'NI booking rescheduled body with placeholder1Value and placeholder2Value',
      });
    });
  });

  describe('buildReturningCandidateEmailContent', () => {
    const mockDetails: MockDetails = {
      placeholder1: 'placeholder1Value',
      placeholder2: 'placeholder2Value',
    };

    test('builds GB email content with placeholder values given GB target', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.GB;

      const content = buildReturningCandidateEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'GB support request subject',
        body: 'GB support request body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds CY email content with placeholder values given CY lang', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.CY;

      const content = buildReturningCandidateEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'CY support request subject',
        body: 'CY support request body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds NI email content with placeholder values given NI target', () => {
      const mockTarget = Target.NI;
      const mockLang = Locale.GB;

      const content = buildReturningCandidateEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'NI support request subject',
        body: 'NI support request body with placeholder1Value and placeholder2Value',
      });
    });
  });

  describe('buildRefundRequestEmailContent', () => {
    const mockDetails: MockDetails = {
      placeholder1: 'placeholder1Value',
      placeholder2: 'placeholder2Value',
    };

    test('builds GB email content with placeholder values given GB target', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.GB;

      const content = buildRefundRequestEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'GB refund request subject',
        body: 'GB refund request body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds CY email content with placeholder values given CY lang', () => {
      const mockTarget = Target.GB;
      const mockLang = Locale.CY;

      const content = buildRefundRequestEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'CY refund request subject',
        body: 'CY refund request body with placeholder1Value and placeholder2Value',
      });
    });

    test('builds NI email content with placeholder values given NI target', () => {
      const mockTarget = Target.NI;
      const mockLang = Locale.GB;

      const content = buildRefundRequestEmailContent(mockDetails as any, mockTarget, mockLang);

      expect(content).toStrictEqual({
        subject: 'NI refund request subject',
        body: 'NI refund request body with placeholder1Value and placeholder2Value',
      });
    });
  });

  describe('buildSupportRequestDetails', () => {
    test('builds correct object', () => {
      const target = Target.GB;
      const booking = mockSessionBooking();

      const result = buildSupportRequestDetails(booking, target);

      expect(result).toEqual({
        reference: booking.bookingRef,
        testType: booking.testType,
        testLanguage: booking.language,
        supportTypes: booking?.selectSupportType,
        voiceover: undefined,
        translator: undefined,
        customSupport: undefined,
        preferredDay: {
          option: booking?.preferredDayOption,
          text: undefined,
        },
        preferredLocation: {
          option: booking?.preferredLocationOption,
          text: undefined,
        },
      });
    });
  });
});
