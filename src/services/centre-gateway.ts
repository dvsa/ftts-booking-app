import authClient from '@dvsa/ftts-auth-client';

import config from '../config';
import { Centre, CentreResponse } from '../domain/types';
import axiosRetryClient from '../libraries/axios-retry-client';

export async function fetchCentres(term: string, region: string, numberOfResults: number): Promise<Centre[]> {
  try {
    const encodedTerm = encodeURIComponent(term);
    const token = await authClient.getToken(config.apim.location);
    const centresResponse = await axiosRetryClient.get<CentreResponse>(`${config.location.baseUrl}v1/test-centres?region=${region}&term=${encodedTerm}&numberOfResults=${numberOfResults}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (centresResponse && centresResponse.data && Array.isArray(centresResponse.data.testCentres)) {
      centresResponse.data.testCentres.forEach((centre) => {
        centre.testCentreId = centre.siteId;
      });

      return centresResponse.data.testCentres;
    }

    return [];
  } catch (error) {
    console.error(error);
    if (error?.response?.data?.status === 400 && error.response.data.message === 'Bad Request - Geocoding api was not able to translate search term into location') {
      return [];
    }
    throw error;
  }
}
