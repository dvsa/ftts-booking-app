import {
  ChainedTokenCredential, ClientSecretCredential, ManagedIdentityCredential, MultiUserManagedIdentityCredential, TokenCredential,
} from '@dvsa/ftts-auth-client';
import DynamicsWebApi, { OnTokenAcquiredCallback } from 'dynamics-web-api';
import config from '../../config';
import { logger } from '../../helpers/logger';

const multiUserEnabled = config.crm.auth.multipleApplicationUsers.enabled;
const multiUserManagedIdentityCredential = new MultiUserManagedIdentityCredential(config.crm.auth.multipleApplicationUsers.clientIds);
const sources: TokenCredential[] = [multiUserEnabled
  ? multiUserManagedIdentityCredential
  : new ManagedIdentityCredential(config.crm.auth.userAssignedEntityClientId)];
if (config.crm.auth.tenantId && config.crm.auth.clientId && config.crm.auth.clientSecret) {
  sources.push(new ClientSecretCredential(config.crm.auth.tenantId, config.crm.auth.clientId, config.crm.auth.clientSecret));
}
const chainedTokenCredential = new ChainedTokenCredential(...sources);
logger.debug('dynamicsWebApi: Token credential configured', { multiUserEnabled });

export const acquireToken = async (dynamicsWebApiCallback: OnTokenAcquiredCallback): Promise<void> => {
  let accessToken;
  try {
    accessToken = await chainedTokenCredential.getToken(config.crm.auth.scope);
  } catch (e) {
    logger.error(e, `dynamicsWebApi::acquireToken: Failed to acquire token: ${(e as Error).message}`, { multiUserEnabled });
  }
  logger.debug('dynamicsWebApi::acquireToken: Token acquired', {
    multiUserEnabled,
    userAssignedClientId: multiUserEnabled
      ? multiUserManagedIdentityCredential.getMostRecentlyPickedClientId()
      : config.crm.auth.userAssignedEntityClientId,
    isEmpty: accessToken == null,
  });
  dynamicsWebApiCallback(accessToken ? accessToken.token : '');
};

export function dynamicsWebApiClient(): DynamicsWebApi {
  logger.debug('dynamicsWebApiClient::config', {
    scope: config.crm.auth.scope,
    clientIds: config.crm.auth.multipleApplicationUsers.clientIds,
  });
  return new DynamicsWebApi({
    webApiUrl: `${config.crm.apiUrl}/`,
    onTokenRefresh: acquireToken,
  });
}
