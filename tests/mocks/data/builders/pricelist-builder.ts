import { build } from '@jackfranklin/test-data-bot';
import { faker } from '@faker-js/faker';
import { PriceListItem } from '../../../../src/domain/types';
import { eligibleTestTypes } from './types';

export const pricelistBuilder = (): PriceListItem => {
  const testType = faker.helpers.arrayElement(eligibleTestTypes);

  return build<PriceListItem>({
    fields: {
      testType,
      price: faker.datatype.number({ min: 25, max: 50 }),
      product: {
        productId: faker.datatype.uuid(),
        parentId: faker.datatype.uuid(),
        name: testType.toString().toUpperCase(),
      },
    },
  })();
};
