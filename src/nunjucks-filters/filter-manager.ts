import nunjucks from 'nunjucks';
import { AssetFilter } from './asset-filter';
import { CurrencyFilter } from './currency-filter';
import { DistanceFilter } from './distance-filter';
import { ErrorFilter } from './error-filter';
import * as dateFilters from './local-date-time-filter';

// Add filters to Nunjucks environment
export function addNunjucksFilters(env: nunjucks.Environment): void {
  // add all the custom filters which will be visible in nunjucks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customFilters: any = {
    ...dateFilters,
    existsAsAnErrorIn: ErrorFilter.existsAsAnErrorIn,
    fieldErrorMessage: ErrorFilter.fieldErrorMessage,
    fieldErrorObject: ErrorFilter.fieldErrorObject,
    toTwoDecimalPlaces: CurrencyFilter.toTwoDecimalPlaces,
    withCurrencySymbol: CurrencyFilter.withCurrencySymbol,
    withCurrencyCode: CurrencyFilter.withCurrencyCode,
    asset: AssetFilter.asset,
    formatDistance: DistanceFilter.formatDistance,
    milesToKilometres: DistanceFilter.milesToKilometres,
  };

  Object.keys(customFilters).forEach((filterName) => {
    env.addFilter(filterName, customFilters[`${filterName}`]);
  });
}
