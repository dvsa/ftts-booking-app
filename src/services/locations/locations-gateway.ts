import config from '../../config';
import { Centre, CentreResponse } from '../../domain/types';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { AxiosRetryClient } from '../../libraries/axios-retry-client';
import { ManagedIdentityAuth } from '../auth/managed-identity-auth';

export class LocationsGateway {
  constructor(
    private auth: ManagedIdentityAuth = new ManagedIdentityAuth(config.location.identity),
    private axiosRetryClient = new AxiosRetryClient(config.location.retryPolicy).getClient(),
  ) {}

  public async fetchCentres(term: string, region: string, numberOfResults: number): Promise<Centre[]> {
    try {
      const encodedTerm = encodeURIComponent(term);
      const authHeader = await this.auth.getAuthHeader();
      const url = `${config.location.baseUrl}v1/test-centres?region=${region}&term=${encodedTerm}&numberOfResults=${numberOfResults}`;

      logger.debug(`LocationsGateway::fetchCentres: Attempting to get test centres using url ${url}`);
      const centresResponse = await this.axiosRetryClient.get<CentreResponse>(url, authHeader);
      logger.debug('LocationsGateway::fetchCentres: Locations Response', { response: centresResponse.data });

      if (centresResponse && centresResponse.data && Array.isArray(centresResponse.data.testCentres)) {
        centresResponse.data.testCentres.forEach((centre) => {
          centre.testCentreId = centre.ftts_tcntestcentreid;
        });

        return centresResponse.data.testCentres;
      }

      return [];
    } catch (error) {
      const eventPayload = {
        message: error.message,
        response: error.response,
        region,
        term,
      };
      logger.error(error, `LocationsGateway::fetchCentres: Error retrieving test centres from locations api. Term: ${term} Region: ${region}`);
      if (error?.response?.data?.status === 401 || error?.response?.data?.status === 403) {
        logger.event(BusinessTelemetryEvents.LOC_AUTH_ISSUE, 'LocationsGateway::fetchCentres: Bad Request - Geocoding api was not able to translate search term into location', {
          message: eventPayload.message,
          term: eventPayload.term,
          region: eventPayload.region,
          ...eventPayload.response,
        });
      }
      if (error?.response?.data?.status < 500) {
        logger.event(BusinessTelemetryEvents.LOC_REQUEST_ISSUE, 'LocationsGateway::fetchCentres: Bad Request - Geocoding api was not able to translate search term into location', {
          message: eventPayload.message,
          term: eventPayload.term,
          region: eventPayload.region,
          ...eventPayload.response,
        });
      }
      if (error?.response?.data?.status >= 500) {
        logger.event(BusinessTelemetryEvents.LOC_ERROR, 'LocationsGateway::fetchCentres: Bad Request - Geocoding api was not able to translate search term into location', {
          message: eventPayload.message,
          term: eventPayload.term,
          region: eventPayload.region,
          ...eventPayload.response,
        });
      }
      if (error?.response?.data?.status === 400 && error.response.data.message === 'Bad Request - Geocoding api was not able to translate search term into location') {
        return [];
      }
      throw error;
    }
  }
}

export default new LocationsGateway();
