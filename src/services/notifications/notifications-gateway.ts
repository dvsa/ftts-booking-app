import authClient, { IAuthClient } from '@dvsa/ftts-auth-client';

import config from '../../config';
import logger from '../../helpers/logger';
import { TARGET } from '../../domain/enums';
import { EmailContent } from './types';
import axiosRetryClient from '../../libraries/axios-retry-client';

const EMAIL_ENDPOINT = 'email';

export class NotificationsGateway {
  public static getInstance(): NotificationsGateway {
    if (!NotificationsGateway.instance) {
      NotificationsGateway.instance = new NotificationsGateway(authClient);
    }
    return NotificationsGateway.instance;
  }

  private static instance: NotificationsGateway;

  constructor(
    private auth: IAuthClient,
    private apiUrl: string = config.notification.baseUrl,
    private contextId: string = config.serviceContextId,
  ) { }

  public async sendEmail(emailAddress: string, content: EmailContent, reference: string, target: TARGET): Promise<void> {
    const { subject, body } = content;
    const payload = {
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
      logger.warn('Notification API send email request failed', {
        reference,
        error: error.toString(),
        status: error.response?.status,
        response: error.response?.data,
      });
      throw error;
    }
  }

  private async sendRequest(endpoint: string, payload: object): Promise<void> {
    const url = `${this.apiUrl}${endpoint}`;
    const token = await this.auth.getToken(config.apim.notification);
    const requestConfig = { headers: { Authorization: `Bearer ${token.value}` } };
    await axiosRetryClient.post(url, payload, requestConfig);
  }
}
