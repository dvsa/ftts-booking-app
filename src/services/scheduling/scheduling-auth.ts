import {
  ChainedTokenCredential, ClientSecretCredential, ManagedIdentityCredential, TokenCredential,
} from '@azure/identity';
import config from '../../config';
import logger from '../../helpers/logger';

const {
  azureTenantId, azureClientId, azureClientSecret, userAssignedEntityClientId,
} = config.apim.scheduling.identity;

export class SchedulingAuth {
  private static instance: SchedulingAuth;

  constructor(private schedulingToken: TokenCredential = new ChainedTokenCredential(
    new ManagedIdentityCredential(userAssignedEntityClientId),
    new ClientSecretCredential(azureTenantId, azureClientId, azureClientSecret),
  )) { }

  public static getInstance(): SchedulingAuth {
    if (!SchedulingAuth.instance) {
      SchedulingAuth.instance = new SchedulingAuth();
    }

    return SchedulingAuth.instance;
  }

  public async getToken(): Promise<string | undefined> {
    try {
      const activeToken = await this.schedulingToken.getToken(config.apim.scheduling.identity.scope);
      return activeToken?.token;
    } catch (error) {
      logger.error(error, 'SchedulingAuth::getToken Unable to retrieve Scheduling Auth token');
      return undefined;
    }
  }
}
