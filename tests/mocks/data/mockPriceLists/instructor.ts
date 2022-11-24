import { CRMProductNumber } from '../../../../src/services/crm-gateway/enums';
import { CRMProductPriceLevel } from '../../../../src/services/crm-gateway/interfaces';

const mockAdiHptPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'adi hpt',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.ADIHPT,
  amount: 11.0000,
};

const mockErsPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'ers',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.ERS,
  amount: 66.0000,
};

const mockAdiP1PriceList: CRMProductPriceLevel = {
  productid: {
    name: 'adi p1',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.ADIP1,
  amount: 81.0000,
};

const mockAmiP1PriceList: CRMProductPriceLevel = {
  productid: {
    name: 'ami p1',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.AMIP1,
  amount: 64.0000,
};

const mockAdiP1DvaPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'adi p1 dva',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.ADIP1DVA,
  amount: 64.0000,
};

export {
  mockAdiHptPriceList,
  mockErsPriceList,
  mockAdiP1PriceList,
  mockAmiP1PriceList,
  mockAdiP1DvaPriceList,
};
