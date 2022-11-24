import { addressParser, Address } from '@dvsa/egress-filtering';
import config from '../../config';

export const ALLOWED_ADDRESSES: Array<Address> = [
  addressParser.parseUri(config.crm.apiUrl),
  addressParser.parseUri(config.location.baseUrl),
  addressParser.parseUri(config.notification.baseUrl),
  addressParser.parseUri(config.payment.baseUrl),
  addressParser.parseUri(config.scheduling.baseUrl),
  addressParser.parseUri(config.eligibility.baseUrl),
  addressParser.parseUri(config.googleAnalytics.url),
];
