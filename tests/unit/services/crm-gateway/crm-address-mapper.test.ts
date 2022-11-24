import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { mapToCrmContactAddress } from '../../../../src/services/crm-gateway/crm-address-mapper';

describe('mapToCrmContactAddress', () => {
  const address: ELIG.Address = {
    line1: '126 Harrow Rd',
    postcode: 'NW1 4FD',
  };

  test.each([
    undefined,
    {} as ELIG.Address,
  ])('given an address with no lines then return undefined for all properties', (emptyAddress) => {
    expect(mapToCrmContactAddress(emptyAddress)).toStrictEqual({
      address1_line1: undefined,
      address1_line2: undefined,
      address1_line3: undefined,
      ftts_address1_line4: undefined,
      address1_city: undefined,
      address1_postalcode: undefined,
    });
  });

  test('given an address with missing lines 2-5 incl then it takes the postcode as the city keeping the postcode itself', () => {
    expect(mapToCrmContactAddress(address)).toStrictEqual({
      address1_line1: address.line1,
      address1_line2: undefined,
      address1_line3: undefined,
      ftts_address1_line4: undefined,
      address1_city: address.postcode,
      address1_postalcode: address.postcode,
    });
  });

  test('given an address with missing lines 3-5 incl then it takes line 2 as the city and nullifies line 2', () => {
    const partialAddress = { ...address, line2: 'West Ruislip' };

    expect(mapToCrmContactAddress(partialAddress)).toStrictEqual({
      address1_line1: partialAddress.line1,
      address1_line2: undefined,
      address1_line3: undefined,
      ftts_address1_line4: undefined,
      address1_city: partialAddress.line2,
      address1_postalcode: address.postcode,
    });
  });

  test('given an address with missing lines 4-5 incl then it takes line 3 as the city and nullifies line 3', () => {
    const partialAddress = { ...address, line2: 'West Ruislip', line3: 'London' };

    expect(mapToCrmContactAddress(partialAddress)).toStrictEqual({
      address1_line1: partialAddress.line1,
      address1_line2: partialAddress.line2,
      address1_line3: undefined,
      ftts_address1_line4: undefined,
      address1_city: partialAddress.line3,
      address1_postalcode: address.postcode,
    });
  });

  test('given an address with missing line 5 ONLY then it takes line 4 as the city and nullifies line 4', () => {
    const partialAddress = {
      ...address,
      line2: 'Sentintel Tower',
      line3: 'West Ruislip',
      line4: 'London',
    };

    expect(mapToCrmContactAddress(partialAddress)).toStrictEqual({
      address1_line1: partialAddress.line1,
      address1_line2: partialAddress.line2,
      address1_line3: partialAddress.line3,
      ftts_address1_line4: undefined,
      address1_city: partialAddress.line4,
      address1_postalcode: address.postcode,
    });
  });

  test('given an address with missing multiple successive lines then it takes the last populated one as the city and nullifies the line itself', () => {
    const partialAddress = {
      ...address,
      line4: 'London',
    };

    expect(mapToCrmContactAddress(partialAddress)).toStrictEqual({
      address1_line1: partialAddress.line1,
      address1_line2: undefined,
      address1_line3: undefined,
      ftts_address1_line4: undefined,
      address1_city: 'London',
      address1_postalcode: address.postcode,
    });
  });

  test('given an address with missing multiple non-successive lines then it takes the last populated one as the city and nullifies the line itself', () => {
    const partialAddress = {
      ...address,
      line3: 'Sentinel Tower',
      line5: 'Nottingham',
    };

    expect(mapToCrmContactAddress(partialAddress)).toStrictEqual({
      address1_line1: partialAddress.line1,
      address1_line2: undefined,
      address1_line3: 'Sentinel Tower',
      ftts_address1_line4: undefined,
      address1_city: 'Nottingham',
      address1_postalcode: address.postcode,
    });
  });

  test('given an address with all lines present then it maps line 5 to the city with no changes (default scenario)', () => {
    const partialAddress = {
      ...address,
      line2: 'Sentinel Tower',
      line3: 'West Ruislip',
      line4: 'Borough of Harrow and Ruislip',
      line5: 'London',
    };

    expect(mapToCrmContactAddress(partialAddress)).toStrictEqual({
      address1_line1: partialAddress.line1,
      address1_line2: 'Sentinel Tower',
      address1_line3: 'West Ruislip',
      ftts_address1_line4: 'Borough of Harrow and Ruislip',
      address1_city: 'London',
      address1_postalcode: address.postcode,
    });
  });
});
