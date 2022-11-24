import axios, { AxiosInstance } from 'axios';
import axiosRetry, { isNetworkError, isRetryableError } from 'axios-retry';

import { RetryPolicy } from '../config';
import {
  is429Error, isGatewayError, isUserCancelledError, calculateRetryDelay, isSystemError,
} from './axios-retry-client-helper';

export class AxiosRetryClientForPaymentErrors {
  axiosRetryClient: AxiosInstance;

  constructor(private retryPolicy: RetryPolicy) {
    this.axiosRetryClient = axios.create();
    this.setupAxiosRetry();
  }

  public getClient(): AxiosInstance {
    return this.axiosRetryClient;
  }

  private setupAxiosRetry() {
    axiosRetry(this.axiosRetryClient, {
      retries: this.retryPolicy.maxRetries,
      // Retry if network/connection error, 5xx response or 429 response and if User did not cancel and is not Gateway or system error.
      retryCondition: (err) => !isUserCancelledError(err) && !isGatewayError(err) && !isSystemError(err) && (isNetworkError(err) || isRetryableError(err) || is429Error(err)),
      retryDelay: (retryCount, err) => calculateRetryDelay(retryCount, err, this.retryPolicy),
    });
  }
}
