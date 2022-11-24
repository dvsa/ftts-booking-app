import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';

export const addressBuilder = (line5?: string): ELIG.Address => {
  const overrides = {
    line5,
  };

  return build<ELIG.Address>({
    fields: {
      line1: faker.address.secondaryAddress(),
      line2: faker.address.street(),
      line3: faker.address.cityName(),
      line4: faker.address.county(),
      line5: undefined,
      postcode: `${faker.address.countryCode('alpha-3')} ${faker.address.countryCode('alpha-3')}`,
    },
  })({
    overrides,
  });
};
