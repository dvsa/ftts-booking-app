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

const mockBookingStandardCarGb: CRMBookingDetails = {
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
    ftts_testsupportneed: '',
    ftts_owedcompbookingassigned: '',
    ftts_zerocostbooking: false,
    ftts_owedcompbookingrecognised: '',
    ftts_reference: 'B-000-010-001',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardCarGb2: CRMBookingDetails = {
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardMotorcycleGb: CRMBookingDetails = {
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
  ftts_testlanguage: CRMTestLanguage.Welsh,
  ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardPcvHptGb: CRMBookingDetails = {
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardAdiP1Gb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-001-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'ADIP1',
    productnumber: CRMProductNumber.ADIP1,
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardAdiHptGb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-002-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'ADIHPT',
    productnumber: CRMProductNumber.ADIHPT,
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardErsGb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-003-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'ERS',
    productnumber: CRMProductNumber.ERS,
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingChangeInProgressGb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-004-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'Car test',
    productnumber: CRMProductNumber.CAR,
  },
  ftts_bookingstatus: CRMBookingStatus.ChangeInProgress,
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingCancelledGb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-005-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'Car test',
    productnumber: CRMProductNumber.CAR,
  },
  ftts_bookingstatus: CRMBookingStatus.Cancelled,
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
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'B-000-010-005',
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_owedcompbookingassigned: '2021-08-30T10:00:00Z',
    ftts_owedcompbookingrecognised: null,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'Birmingham',
      address1_line1: '38 Dale End',
      address1_line2: 'Test',
      address1_city: 'Birmingham',
      address1_county: 'West Midlands',
      address1_postalcode: 'B4 7NJ',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardCscSuccessGb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'C-000-010-001-01',
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
    ftts_reference: 'C-000-010-001',
    ftts_origin: CRMOrigin.CustomerServiceCentre,
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'My Test Centre',
      address1_line1: 'Address Line 1',
      address1_line2: 'Address Line 2',
      address1_city: 'City',
      address1_county: 'County',
      address1_postalcode: 'Postcode',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardCscFailureGb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'C-000-010-001-01',
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
  ftts_paymentstatus: CRMPaymentStatus.Failure,
  ftts_price: 23.00,
  ftts_salesreference: '11-22-33',
  createdon: '2020-12-30T10:00:00Z',
  ftts_bookingid: {
    ftts_foreignlanguageselected: '',
    ftts_owedcompbookingassigned: '',
    ftts_owedcompbookingrecognised: '',
    ftts_testsupportneed: '',
    ftts_zerocostbooking: false,
    ftts_reference: 'C-000-010-001',
    ftts_origin: CRMOrigin.CustomerServiceCentre,
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'My Test Centre',
      address1_line1: 'Address Line 1',
      address1_line2: 'Address Line 2',
      address1_city: 'City',
      address1_county: 'County',
      address1_postalcode: 'Postcode',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardPrevPassedGb : CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-001-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'Car test',
    productnumber: CRMProductNumber.CAR,
  },
  ftts_bookingstatus: CRMBookingStatus.CompletePassed,
  ftts_testdate: '2019-12-30T10:00:00Z',
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'My Test Centre',
      address1_line1: 'Address Line 1',
      address1_line2: 'Address Line 2',
      address1_city: 'City',
      address1_county: 'County',
      address1_postalcode: 'Postcode',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

const mockBookingStandardPrevFailedGb: CRMBookingDetails = {
  ftts_bookingproductid: '1115e591-75ca-ea11-a812-00224801cecd',
  _ftts_bookingid_value: '1115e591-75ca-ea11-a812-00224801cecd',
  ftts_reference: 'B-000-010-001-01',
  ftts_productid: {
    productid: '1115e591-75ca-ea11-a812-00224801cecd',
    _parentproductid_value: '1115e591-75ca-ea11-a812-00224801cecd',
    name: 'Car test',
    productnumber: CRMProductNumber.CAR,
  },
  ftts_bookingstatus: CRMBookingStatus.CompleteFailed,
  ftts_testdate: '2019-12-30T10:00:00Z',
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
    ftts_governmentagency: CRMGovernmentAgency.Dvsa,
    ftts_enableeligibilitybypass: false,
    ftts_nonstandardaccommodation: false,
    ftts_testcentre: {
      ftts_siteid: 'SITE-0001',
      name: 'My Test Centre',
      address1_line1: 'Address Line 1',
      address1_line2: 'Address Line 2',
      address1_city: 'City',
      address1_county: 'County',
      address1_postalcode: 'Postcode',
      ftts_remit: CRMRemit.England,
      accountid: '',
      ftts_tcntestcentreid: '1',
      parentaccountid: {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      },
    },
  },
};

export {
  mockBookingStandardCarGb,
  mockBookingStandardCarGb2,
  mockBookingStandardMotorcycleGb,
  mockBookingStandardPcvHptGb,
  mockBookingStandardAdiP1Gb,
  mockBookingStandardAdiHptGb,
  mockBookingStandardErsGb,
  mockBookingStandardCscSuccessGb,
  mockBookingStandardCscFailureGb,
  mockBookingStandardPrevPassedGb,
  mockBookingStandardPrevFailedGb,
  mockBookingChangeInProgressGb,
  mockBookingCancelledGb,
};