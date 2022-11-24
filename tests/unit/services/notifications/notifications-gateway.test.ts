import { AxiosStatic } from 'axios';
import { Target } from '../../../../src/domain/enums';
import { EmailContent } from '../../../../src/services/notifications/types';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers/logger';
import { ManagedIdentityAuth } from '../../../../src/services/auth/managed-identity-auth';

const mockedAxios = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');

describe('Notifications API gateway', () => {
  let notifications: NotificationsGateway;

  const mockNotificationsUrl = 'notifications.com/notification/';
  const mockContextId = 'BOOKING-APP';
  const mockBookingRef = '12345';
  const mockAccessToken = { value: '1234-5678' };
  const mockEmailAddress = 'mock@email.com';
  const mockEmailContent: EmailContent = {
    subject: 'mockSubject',
    body: 'mockBody',
  };
  const mockTarget = Target.GB;

  beforeEach(() => {
    const mockAuthClient = {
      getAuthHeader: () => ({
        headers: {
          Authorization: `Bearer ${mockAccessToken.value}`,
        },
      }),
    };

    notifications = new NotificationsGateway(
      mockAuthClient as unknown as ManagedIdentityAuth,
      mockedAxios,
      mockNotificationsUrl,
      mockContextId,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('sendEmail', () => {
    test('should send a request with correct email payload and auth headers set', async () => {
      await notifications.sendEmail(mockEmailAddress, mockEmailContent, mockBookingRef, mockTarget);

      const expectedUrl = `${mockNotificationsUrl}email`;
      const expectedPayload = {
        email_address: mockEmailAddress,
        reference: mockBookingRef,
        target: mockTarget,
        message_subject: mockEmailContent.subject,
        message_content: mockEmailContent.body,
        context_id: mockContextId,
      };
      const expectedConfig = { headers: { Authorization: `Bearer ${mockAccessToken.value}` } };
      expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, expectedPayload, expectedConfig);
    });

    test('should log and rethrow if request fails', async () => {
      mockedAxios.post.mockImplementationOnce(() => {
        throw Error('ntf error');
      });

      await expect(notifications.sendEmail('mock@email.com', mockEmailContent, mockBookingRef, Target.GB)).rejects.toThrow();

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.NOTIF_AUTH_ISSUE,
        'NotificationsGateway::sendRequest: Post failed',
        {
          error: Error('ntf error'),
          endpoint: 'email',
        },
      );
      expect(logger.error).toHaveBeenCalledWith(Error('ntf error'), 'NotificationsGateway::sendEmail: Notification API send email request failed');
    });
  });
});
