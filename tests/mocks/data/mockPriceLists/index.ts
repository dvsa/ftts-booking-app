import DynamicsWebApi from 'dynamics-web-api';
import { CRMProductPriceLevel } from '../../../../src/services/crm-gateway/interfaces';
import {
  mockAdiHptPriceList, mockAdiP1DvaPriceList, mockAdiP1PriceList, mockAmiP1PriceList, mockErsPriceList,
} from './instructor';
import {
  mockCarPriceList, mockLgvCpccPriceList, mockLgvCpcPriceList, mockLgvHptPriceList, mockLgvMcPriceList, mockMotorcyclePriceList, mockPcvCpccPriceList, mockPcvCpcPriceList, mockPcvHptPriceList, mockPcvMcPriceList, mockTaxiPriceList,
} from './standard';

const productpricelist: DynamicsWebApi.RetrieveMultipleResponse<CRMProductPriceLevel> = {
  value: [
    mockPcvHptPriceList,
    mockPcvMcPriceList,
    mockCarPriceList,
    mockLgvCpcPriceList,
    mockLgvCpccPriceList,
    mockLgvMcPriceList,
    mockLgvHptPriceList,
    mockMotorcyclePriceList,
    mockPcvCpccPriceList,
    mockPcvCpcPriceList,
    mockTaxiPriceList,
    mockAdiHptPriceList,
    mockErsPriceList,
    mockAdiP1PriceList,
    mockAmiP1PriceList,
    mockAdiP1DvaPriceList,
  ],
};

export default productpricelist;
