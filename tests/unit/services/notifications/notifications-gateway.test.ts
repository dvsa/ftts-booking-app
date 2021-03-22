import { TARGET } from '../../../../src/domain/enums';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import logger from '../../../../src/helpers/logger';
import axiosRetryClient from '../../../../src/libraries/axios-retry-client';

jest.mock('../../../../src/libraries/axios-retry-client');
const mockedAxios = axiosRetryClient as jest.Mocked<typeof axiosRetryClient>;

describe('Notifications API gateway', () => {
  let notifications;

  const mockNotificationsUrl = 'notifications.com/notification/';
  const mockContextId = 'BOOKING-APP';
  const mockAccessToken = { value: '1234-5678' };

  beforeEach(() => {
    const mockAuthClient = {
      getToken: () => mockAccessToken,
    };

    notifications = new NotificationsGateway(
      mockAuthClient as any,
      mockNotificationsUrl,
      mockContextId,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('sendEmail', () => {
    test('should send a request with correct email payload and auth headers set', async () => {
      const mockEmailAddress = 'mock@email.com';
      const mockContent = { subject: 'subject', body: 'body' };
      const mockBookingRef = '12345';
      const mockTarget = TARGET.GB;

      await notifications.sendEmail(mockEmailAddress, mockContent, mockBookingRef, mockTarget);

      const expectedUrl = `${mockNotificationsUrl}email`;
      const expectedPayload = {
        email_address: mockEmailAddress,
        reference: mockBookingRef,
        target: mockTarget,
        message_subject: 'subject',
        message_content: 'body',
        context_id: mockContextId,
      };
      const expectedConfig = { headers: { Authorization: `Bearer ${mockAccessToken.value}` } };
      expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, expectedPayload, expectedConfig);
    });

    test('should log and rethrow if request fails', async () => {
      mockedAxios.post.mockImplementationOnce(() => {
        throw Error('ntf error');
      });

      await expect(notifications.sendEmail('mock@email.com', '12345', TARGET.GB)).rejects.toThrow();

      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
