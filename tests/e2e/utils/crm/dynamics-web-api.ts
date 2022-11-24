import { ClientSecretCredential } from '@dvsa/ftts-auth-client';
import DynamicsWebApi from 'dynamics-web-api';
import config from '../../../../src/config';

const tokenCredential = new ClientSecretCredential(config.crm.auth.tenantId, config.crm.auth.clientId, config.crm.auth.clientSecret);

const onTokenRefresh = async (dynamicsWebApiCallback: (token: string) => void): Promise<void> => {
  try {
    const accessToken = await tokenCredential.getToken(config.crm.auth.scope);
    dynamicsWebApiCallback(accessToken.token);
  } catch (error) {
    // Callback needs to be called - to prevent function from hanging
    dynamicsWebApiCallback('');
  }
};

export function dynamicsWebApiClient(): DynamicsWebApi {
  return new DynamicsWebApi({
    webApiUrl: `${config.crm.apiUrl}/`,
    onTokenRefresh,
  });
}
