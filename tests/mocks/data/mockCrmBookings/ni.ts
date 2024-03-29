import { CRMBookingDetails } from '../../../../src/services/crm-gateway/interfaces';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMOrigin,
  CRMRemit,
  CRMTestLanguage,
  CRMVoiceOver,
  CRMPaymentStatus,
  CRMGovernmentAgency,
  CRMProductNumber,
} from '../../../../src/services/crm-gateway/enums';

const mockBookingStandardCarNi: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-001-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'Car test',
    productnumber: CRMProductNumber.CAR,
  },
  ftts_bookingstatus: CRMBookingStatus.Confirmed,
  ftts_testdate: '2020-12-30T10:00:00Z',
  ftts_testlanguage: CRMTestLanguage.English,
  ftts_voiceoverlanguage: CRMVoiceOver.None,
  ftts_additionalsupportoptions: CRMAdditionalSupport.None,
  ftts_paymentstatus: CRMPaymentStatus.Success,
  ftts_price: 23.00,
  ftts_salesreference: '11-22-33',
  createdon: '2020-12-30T10:00:00Z',
  ftts_bookingid: {
    ftts_foreignlanguageselected: '',
    ftts_owedcompbookingassigned: '',
    ftts_owedcompbookingrecognised: '',
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'B-000-010-001',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dva,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Belfast',
      address1_line1: '5th Floor, Chambers of Commerce House',
      address1_line2: '22 Great Victoria Street',
      address1_city: 'Belfast',
      address1_county: 'Belfast',
      address1_postalcode: 'BT2 7LX',
      ftts_remit: CRMRemit.NorthernIreland,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: false,
        ftts_regionb: true,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardCarNi2: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-003-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'Car test',
    productnumber: CRMProductNumber.CAR,
  },
  ftts_bookingstatus: CRMBookingStatus.Confirmed,
  ftts_testdate: '2020-12-30T10:00:00Z',
  ftts_testlanguage: CRMTestLanguage.English,
  ftts_voiceoverlanguage: CRMVoiceOver.None,
  ftts_additionalsupportoptions: CRMAdditionalSupport.None,
  ftts_paymentstatus: CRMPaymentStatus.Success,
  ftts_price: 23.00,
  ftts_salesreference: '11-22-33',
  createdon: '2020-12-30T10:00:00Z',
  ftts_bookingid: {
    ftts_foreignlanguageselected: '',
    ftts_owedcompbookingassigned: '',
    ftts_owedcompbookingrecognised: '',
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'B-000-010-003',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dva,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Belfast',
      address1_line1: '5th Floor, Chambers of Commerce House',
      address1_line2: '22 Great Victoria Street',
      address1_city: 'Belfast',
      address1_county: 'Belfast',
      address1_postalcode: 'BT2 7LX',
      ftts_remit: CRMRemit.NorthernIreland,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: false,
        ftts_regionb: false,
        ftts_regionc: true,
      },
    },
  },
};

const mockBookingStandardMotorcycleNi: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-002-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'Motorcycle test',
    productnumber: CRMProductNumber.MOTORCYCLE,
  },
  ftts_bookingstatus: CRMBookingStatus.Confirmed,
  ftts_testdate: '2020-12-31T10:00:00Z',
  ftts_testlanguage: CRMTestLanguage.English,
  ftts_voiceoverlanguage: CRMVoiceOver.English,
  ftts_additionalsupportoptions: CRMAdditionalSupport.BritishSignLanguage,
  ftts_paymentstatus: CRMPaymentStatus.Success,
  ftts_price: 23.00,
  ftts_salesreference: '11-22-33',
  createdon: '2020-12-30T10:00:00Z',
  ftts_bookingid: {
    ftts_foreignlanguageselected: '',
    ftts_owedcompbookingassigned: '',
    ftts_owedcompbookingrecognised: '',
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'B-000-010-002',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dva,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Belfast',
      address1_line1: '5th Floor, Chambers of Commerce House',
      address1_line2: '22 Great Victoria Street',
      address1_city: 'Belfast',
      address1_county: 'Belfast',
      address1_postalcode: 'BT2 7LX',
      ftts_remit: CRMRemit.NorthernIreland,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: false,
        ftts_regionb: false,
        ftts_regionc: true,
      },
    },
  },
};

const mockBookingStandardPcvHptNi: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-004-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'PCV HPT test',
    productnumber: CRMProductNumber.PCVHPT,
  },
  ftts_bookingstatus: CRMBookingStatus.Confirmed,
  ftts_testdate: '2020-12-30T10:00:00Z',
  ftts_testlanguage: CRMTestLanguage.English,
  ftts_voiceoverlanguage: CRMVoiceOver.None,
  ftts_additionalsupportoptions: CRMAdditionalSupport.None,
  ftts_paymentstatus: CRMPaymentStatus.Success,
  ftts_price: 23.00,
  ftts_salesreference: '11-22-33',
  createdon: '2020-12-30T10:00:00Z',
  ftts_bookingid: {
    ftts_foreignlanguageselected: '',
    ftts_owedcompbookingassigned: '',
    ftts_owedcompbookingrecognised: '',
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'B-000-010-004',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dva,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Belfast',
      address1_line1: '5th Floor, Chambers of Commerce House',
      address1_line2: '22 Great Victoria Street',
      address1_city: 'Belfast',
      address1_county: 'Belfast',
      address1_postalcode: 'BT2 7LX',
      ftts_remit: CRMRemit.NorthernIreland,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: false,
        ftts_regionb: false,
        ftts_regionc: true,
      },
    },
  },
};

const mockBookingStandardAdiP1Ni: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-001-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'ADIP1DVA',
    productnumber: CRMProductNumber.ADIP1DVA,
  },
  ftts_bookingstatus: CRMBookingStatus.Confirmed,
  ftts_testdate: '2020-12-30T10:00:00Z',
  ftts_testlanguage: CRMTestLanguage.English,
  ftts_voiceoverlanguage: CRMVoiceOver.None,
  ftts_additionalsupportoptions: CRMAdditionalSupport.None,
  ftts_paymentstatus: CRMPaymentStatus.Success,
  ftts_price: 23.00,
  ftts_salesreference: '11-22-33',
  createdon: '2020-12-30T10:00:00Z',
  ftts_bookingid: {
    ftts_foreignlanguageselected: '',
    ftts_owedcompbookingassigned: '',
    ftts_owedcompbookingrecognised: '',
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'B-000-010-001',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dva,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Belfast',
      address1_line1: '5th Floor, Chambers of Commerce House',
      address1_line2: '22 Great Victoria Street',
      address1_city: 'Belfast',
      address1_county: 'Belfast',
      address1_postalcode: 'BT2 7LX',
      ftts_remit: CRMRemit.NorthernIreland,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: false,
        ftts_regionb: false,
        ftts_regionc: true,
      },
    },
  },
};

const mockBookingStandardAmiP1Ni: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-002-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'AMIP1',
    productnumber: CRMProductNumber.AMIP1,
  },
  ftts_bookingstatus: CRMBookingStatus.Confirmed,
  ftts_testdate: '2020-12-31T10:00:00Z',
  ftts_testlanguage: CRMTestLanguage.English,
  ftts_voiceoverlanguage: CRMVoiceOver.None,
  ftts_additionalsupportoptions: CRMAdditionalSupport.None,
  ftts_paymentstatus: CRMPaymentStatus.Success,
  ftts_price: 23.00,
  ftts_salesreference: '11-22-33',
  createdon: '2020-12-30T10:00:00Z',
  ftts_bookingid: {
    ftts_foreignlanguageselected: '',
    ftts_owedcompbookingassigned: '',
    ftts_owedcompbookingrecognised: '',
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'B-000-010-002',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dva,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Belfast',
      address1_line1: '5th Floor, Chambers of Commerce House',
      address1_line2: '22 Great Victoria Street',
      address1_city: 'Belfast',
      address1_county: 'Belfast',
      address1_postalcode: 'BT2 7LX',
      ftts_remit: CRMRemit.NorthernIreland,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: false,
        ftts_regionb: false,
        ftts_regionc: true,
      },
    },
  },
};

export {
  mockBookingStandardCarNi,
  mockBookingStandardCarNi2,
  mockBookingStandardMotorcycleNi,
  mockBookingStandardPcvHptNi,
  mockBookingStandardAdiP1Ni,
  mockBookingStandardAmiP1Ni,
};
