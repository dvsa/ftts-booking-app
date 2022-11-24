import { ELIG } from '@dvsa/ftts-eligibility-api-model';

const eligTesterTesterGb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '11111111-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Tester',
    surname: 'Tester',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2000-01-01',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVHPT,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVMC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVCPC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVCPCC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVHPT,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVMC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVCPC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVCPCC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.ADIHPT,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.ADIP1,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.ERS,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '123456',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligTesterTester2Gb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '22222222-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Tester',
    surname: 'Tester',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2000-01-01',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVHPT,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVMC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligTesterTester3Gb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '33333333-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Tester',
    surname: 'Tester',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2000-01-01',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligTesterTester4Gb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '44444444-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Tester',
    surname: 'Tester',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2000-01-01',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligTesterTester5Gb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '55555555-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Tester',
    surname: 'Tester',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2000-01-01',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligTesterTester6Gb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '66666666-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Tester',
    surname: 'Tester',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2000-01-01',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligTesterTester7Gb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '77777777-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Tester',
    surname: 'Tester',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2000-01-01',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligWendyJonesGb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '11111111-75ca-ea11-a812-00224801cecd',
    title: 'Mrs',
    name: 'Wendy',
    surname: 'Jones',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '2002-11-10',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVHPT,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVMC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVCPC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.PCVCPCC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVHPT,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVMC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVCPC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.LGVCPCC,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligAbdurRahmanBentonGb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '51ea61c5-dedb-ea11-a813-00224801cecd',
    title: 'Mr',
    name: 'Abdur-Rahman',
    surname: 'Benton',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '1966-03-02',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligDavidWilliamsGb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '1115e591-75ca-ea11-a812-00224801cecd',
    title: 'Mr',
    name: 'David',
    surname: 'Williams',
    gender: ELIG.CandidateDetails.GenderEnum.M,
    dateOfBirth: '1999-12-11',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: true,
    behaviouralMarkerExpiryDate: '2099-01-01',
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligTasneemAvilaGb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '1115e591-75ca-ea11-a812-00224801cecd',
    title: 'Miss',
    name: 'Tasneem',
    surname: 'Avila',
    gender: ELIG.CandidateDetails.GenderEnum.F,
    dateOfBirth: '1972-10-08',
    address: {
      line1: '1 Some Street',
      line2: 'Some Town',
      line5: 'West Midlands',
      postcode: 'B1 2TT',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
    behaviouralMarkerExpiryDate: '',
  },
  eligibilities: [{
    eligible: false,
    testType: ELIG.Eligibility.TestTypeEnum.CAR,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2020-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: false,
    testType: ELIG.Eligibility.TestTypeEnum.MOTORCYCLE,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2020-01-01',
    personalReferenceNumber: '',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

const eligPaulDriveInstructorGb: ELIG.EligibilityInformation = {
  candidateDetails: {
    candidateId: '11112222-18a8-eb11-9442-002248016f1c',
    title: 'Mr',
    name: 'Paul',
    surname: 'Drive',
    address: {
      line1: '21 First Street',
      line2: 'Some Village',
      line3: 'Some Town',
      line4: 'Birmingham',
      line5: 'West Midlands',
      postcode: 'B1 1AA',
    },
    dateOfBirth: '2002-11-10',
    gender: ELIG.CandidateDetails.GenderEnum.M,
    eligibleToBookOnline: true,
    behaviouralMarker: false,
  },
  eligibilities: [{
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.ADIHPT,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '859736',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.ADIP1,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '321971',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  },
  {
    eligible: true,
    testType: ELIG.Eligibility.TestTypeEnum.ERS,
    eligibleFrom: '2000-01-01',
    eligibleTo: '2099-01-01',
    personalReferenceNumber: '621309',
    paymentReceiptNumber: '',
    reasonForIneligibility: '',
  }],
};

export {
  eligAbdurRahmanBentonGb,
  eligDavidWilliamsGb,
  eligPaulDriveInstructorGb,
  eligTasneemAvilaGb,
  eligTesterTester2Gb,
  eligTesterTester3Gb,
  eligTesterTester4Gb,
  eligTesterTester5Gb,
  eligTesterTester6Gb,
  eligTesterTester7Gb,
  eligTesterTesterGb,
  eligWendyJonesGb,
};
