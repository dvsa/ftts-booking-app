import config from '../../config';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { Target } from '../../domain/enums';
import { EmailContent } from './types';
import { AuthHeader, ManagedIdentityAuth } from '../auth/managed-identity-auth';
import { AxiosRetryClient } from '../../libraries/axios-retry-client';

const EMAIL_ENDPOINT = 'email';
type EmailPayload = {
  email_address: string;
  message_subject: string;
  message_content: string;
  reference: string;
  target: Target;
  context_id: string;
};

class NotificationsGateway {
  constructor(
    private auth: ManagedIdentityAuth,
    private axiosRetryClient = new AxiosRetryClient(config.notification.retryPolicy).getClient(),
    private apiUrl: string = config.notification.baseUrl,
    private contextId: string = config.serviceContextId,
  ) { }

  public async sendEmail(emailAddress: string, content: EmailContent, reference: string, target: Target): Promise<void> {
    const { subject, body } = content;
    const payload: EmailPayload = {
      email_address: emailAddress,
      message_subject: subject,
      message_content: body,
      reference,
      target,
      context_id: this.contextId,
    };

    try {
      await this.sendRequest(EMAIL_ENDPOINT, payload);
    } catch (error) {
      const errorMessage = 'NotificationsGateway::sendEmail: Notification API send email request failed';
      logger.error(error, errorMessage);
      const errorPayload = {
        reference,
        error: error.toString(),
        status: error.response?.status,
        response: error.response?.data,
      };
      switch (true) {
        case error.response?.status === 401:
        case error.response?.status === 403:
          logger.event(BusinessTelemetryEvents.NOTIF_AUTH_ISSUE, errorMessage, errorPayload);
          break;
        case error.response?.status >= 500 && error.response?.status < 600:
          logger.event(BusinessTelemetryEvents.NOTIF_ERROR, errorMessage, errorPayload);
          break;
        case error.response?.status >= 400 && error.response?.status < 500:
          logger.event(BusinessTelemetryEvents.NOTIF_REQUEST_ISSUE, errorMessage, errorPayload);
          break;
        default:
          logger.warn('NotificationsGateway::sendEmail: Notification API email send failed', {
            errorMessage,
            errorPayload,
          });
      }
      throw error;
    }
  }

  private async sendRequest(endpoint: string, payload: EmailPayload): Promise<void> {
    const url = `${this.apiUrl}${endpoint}`;
    try {
      const header = await this.getToken();
      logger.debug('NotificationsGateway::sendRequest: Raw request payload', {
        url,
        payload,
      });
      const response = await this.axiosRetryClient.post(url, payload, header);
      logger.debug('NotificationsGateway::sendRequest: Raw response', {
        url,
        ...response,
      });
    } catch (error) {
      logger.event(BusinessTelemetryEvents.NOTIF_AUTH_ISSUE, 'NotificationsGateway::sendRequest: Post failed', {
        error,
        endpoint,
      });
      throw error;
    }
  }

  private async getToken(): Promise<AuthHeader> {
    try {
      return await this.auth.getAuthHeader();
    } catch (error) {
      logger.event(BusinessTelemetryEvents.NOTIF_AUTH_ISSUE, 'NotificationsGateway::getToken: Token call failed', { error });
      throw error;
    }
  }
}

const notificationsGateway = new NotificationsGateway(new ManagedIdentityAuth(config.notification.identity));

export {
  notificationsGateway,
  NotificationsGateway,
};
