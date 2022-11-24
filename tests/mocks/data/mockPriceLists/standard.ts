import { CRMProductNumber } from '../../../../src/services/crm-gateway/enums';
import { CRMProductPriceLevel } from '../../../../src/services/crm-gateway/interfaces';

const mockPcvHptPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'pcv hpt',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.PCVHPT,
  amount: 11.0000,
};

const mockPcvMcPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'pcv mc',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.PCVMC,
  amount: 26.0000,
};

const mockCarPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'car',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.CAR,
  amount: 23.0000,
};

const mockLgvCpcPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'lgv cpc',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.LGVCPC,
  amount: 23.0000,
};

const mockLgvCpccPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'lgv cpcc',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.LGVCPCC,
  amount: 23.0000,
};

const mockLgvMcPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'lgv mc',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.LGVMC,
  amount: 26.0000,
};

const mockLgvHptPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'lgv hpt',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.LGVHPT,
  amount: 11.0000,
};

const mockMotorcyclePriceList: CRMProductPriceLevel = {
  productid: {
    name: 'motorcycle',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.MOTORCYCLE,
  amount: 23.0000,
};

const mockPcvCpccPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'pcv cpcc',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.PCVCPCC,
  amount: 23.0000,
};

const mockPcvCpcPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'pcv cpc',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.PCVCPC,
  amount: 23.0000,
};

const mockTaxiPriceList: CRMProductPriceLevel = {
  productid: {
    name: 'taxi',
    productid: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
    _parentproductid_value: '9e1d3e1e-36e3-48e1-b572-fb790f4bd829',
  },
  productnumber: CRMProductNumber.TAXI,
  amount: 12.0000,
};

export {
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
};
