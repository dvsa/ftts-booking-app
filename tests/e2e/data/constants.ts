/* eslint-disable import/no-cycle */
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { PaymentModel } from './payment-model';
import { CpmsPaymentModel } from './cpms-payment-model';
import {
  Language, SupportType, TestType,
} from '../../../src/domain/enums';
import { SessionData } from './session-data';

export const testPayment: PaymentModel = new PaymentModel('1234567890123456', '12', '26', '123');
export const testPaymentCpms: CpmsPaymentModel = new CpmsPaymentModel('Wendy Jones', '4543059790016721', '12', '25', '587', 'Test_6721', 'Some street', 'Some City', 'B1 1AA');

export const TestTypeName: Map<string, string> = new Map([
  [TestType.CAR, 'Car'],
  [TestType.MOTORCYCLE, 'Motorcycle'],
  [TestType.LGVMC, 'LGV - multiple choice'],
  [TestType.LGVHPT, 'LGV - hazard perception'],
  [TestType.LGVCPC, 'LGV - Driver Certificate of Professional Competence (CPC)'],
  [TestType.LGVCPCC, 'LGV to PCV conversion'],
  [TestType.PCVMC, 'PCV - multiple choice'],
  [TestType.PCVHPT, 'PCV - hazard perception'],
  [TestType.PCVCPC, 'PCV - Driver Certificate of Professional Competence (CPC)'],
  [TestType.PCVCPCC, 'PCV to LGV conversion'],
  [TestType.TAXI, 'Taxi'],
  [TestType.ADIP1, 'ADI Part 1'],
  [TestType.ADIHPT, 'ADI hazard perception'],
  [TestType.ERS, 'Enhanced Rider Scheme'],
  [TestType.ADIP1DVA, 'ADI Part 1'],
  [TestType.AMIP1, 'AMI Part 1'],
]);

export const TestTypeToPrice: Map<string, string> = new Map([
  [TestType.CAR, '£23.00'],
  [TestType.MOTORCYCLE, '£23.00'],
  [TestType.LGVMC, '£26.00'],
  [TestType.LGVHPT, '£11.00'],
  [TestType.LGVCPC, '£23.00'],
  [TestType.LGVCPCC, '£23.00'],
  [TestType.PCVMC, '£26.00'],
  [TestType.PCVHPT, '£11.00'],
  [TestType.PCVCPC, '£23.00'],
  [TestType.PCVCPCC, '£23.00'],
  [TestType.TAXI, '£34.00'],
  [TestType.ADIP1, '£81.00'],
  [TestType.ADIHPT, '£11.00'],
  [TestType.ERS, '£66.00'],
  [TestType.ADIP1DVA, '£64.00'],
  [TestType.AMIP1, '£64.00'],
]);

export const Languages: Map<string, string> = new Map([
  [Language.ENGLISH, 'English'],
  [Language.WELSH, 'Cymraeg (Welsh)'],
]);

export const SupportTypeText: Map<string, string> = new Map([
  [SupportType.ON_SCREEN_BSL, 'Sign language (on-screen)'],
  [SupportType.BSL_INTERPRETER, 'Sign language (interpreter)'],
  [SupportType.EXTRA_TIME, 'Extra time'],
  [SupportType.READING_SUPPORT, 'Reading support with answer entry'],
  [SupportType.OTHER, 'Other'],
  [SupportType.TRANSLATOR, 'Translator'],
  [SupportType.VOICEOVER, 'Voiceover'],
  [SupportType.NO_SUPPORT_WANTED, 'I do not need support'],
]);

export enum ManageBookingActionTypes {
  STANDARD_BOOKING,
  NON_STANDARD_BOOKING,
  BLOCKED_ONLINE,
  ELIGIBILITY_OVERRIDE,
}

export const searchWithGBPostcode = 'B1 1TT';
export const searchWithNIPostcode = 'BT7 1NT';
export const searchWithPartialPostcode = 'B15';
export const searchWithAreaName = 'Belfast international airport';
export const searchWithCityName = 'London';
export const searchWithEscapeJavaScript = 'Nice site, I think I\'ll take it. <script>alert(\'Executing JS\')</script>';
export const searchWithLongTerm = 'The main childrens library in the Birmingham city near the new street train station, adjacent to victoria square point where the book fair will be held in this summer 2020 The main childrens library in the Birmingham city near the new street train station, adjacent to victoria square point where the book fair will be held in this summer 2020 The main childrens library in the Birmingham city near the new street train station, adjacent to victoria square point where the book fair will be held in this summer20';
export const searchWithInvalid2Characters = 'B1';
export const searchWithInvalid513Characters = 'The main childrens library in the Birmingham city near the new street train station, adjacent to victoria square point where the book fair will be held in this summer 2020 The main childrens library in the Birmingham city near the new street train station, adjacent to victoria square point where the book fair will be held in this summer 2020 The main childrens library in the Birmingham city near the new street train station, adjacent to victoria square point where the book fair will be held in this summer 20';
export const searchWithZeroReults = 'warningZeroResults';
export const searchWithError = 'errorUnknownError';
export const generalTitle = '- Book your theory test - GOV.UK';
export const generalTitleCY = 'Archebu eich prawf theori - GOV.UK';
export const generalTitleNI = '- Book your theory test - nidirect.gov.uk';
export const stringWith101Chars = 'dfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfg';
export const stringWith4001Chars = 'dfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgdfgdsfgsfgdfgdsfga';

// Manage bookings data - Local
export const bookingReference1 = 'A-000-000-001';
export const bookingReference2 = 'A-000-000-002';
export const bookingReference3 = 'A-000-000-003';
export const bookingReference4 = 'A-000-000-004';
export const drivingLicenceGBSingleBooking = 'AAAAA061102W97YT';
export const drivingLicenceNISingleBooking = '94637193';
export const drivingLicenceGBMultipleBookings = 'BBBBB061102W97YT';
export const drivingLicenceNIMultipleBookings = '55667788';
export const drivingLicenceGBCSCBookingSuccess = 'CCCCC061102W97YT';
export const drivingLicenceGBCSCBookingFailure = 'DDDDD061102W97YT';
export const drivingLicenceGBPrevPassed = 'EEEEE061102W97YT';
export const drivingLicenceGBPrevFailed = 'FFFFF061102W97YT';
export const drivingLicenceErrorHandling = 'GGGGG061102W97YT';

// Mock instructors & candidates who have tests already booked
export function getNICandidateWithBookedTest(sessionData: SessionData): void {
  sessionData.candidate.firstnames = 'Micheal';
  sessionData.candidate.surname = 'Scott';
  sessionData.candidate.dateOfBirth = '2002-11-10';
  sessionData.candidate.licenceNumber = '28139611';
  sessionData.candidate.gender = ELIG.CandidateDetails.GenderEnum.M;
}

export function getGBCandidateWithBookedTest(sessionData: SessionData): void {
  sessionData.candidate.firstnames = 'Micheal';
  sessionData.candidate.surname = 'Scott';
  sessionData.candidate.dateOfBirth = '2002-11-10';
  sessionData.candidate.licenceNumber = 'MICHE351267SO4TB';
  sessionData.candidate.gender = ELIG.CandidateDetails.GenderEnum.M;
}

// Manage bookings data - FTTS Shire
export const bookingReferenceGB = 'B-000-125-892';
export const drivingLicenceGB = 'TESTR252244N93VR';
export const drivingLicenceBulkCompensationGB1 = 'TESTR252244N92ZX';
export const drivingLicenceBulkCompensationGB2 = 'TESTR252244N93ZX';
export const drivingLicenceBulkCompensationGB3 = 'TESTR252244N94ZX';
export const drivingLicenceTemplateGB = 'TESTR252244N9*';
export const bookingReferenceNI = 'B-000-128-849';
export const drivingLicenceBulkCompensationNI1 = '94637180';
export const drivingLicenceBulkCompensationNI2 = '94637181';
export const drivingLicenceBulkCompensationNI3 = '94637182';
export const drivingLicenceNI = '94637193';
export const drivingLicenceTemplateNI = '9463719*';
export const dob = '2000-01-01';
export const nameGB = 'Tester';
export const nameNI = 'TesterNi';

export const setRequestTimeout = new Promise<void>((resolve) => {
  resolve();
});

export const LOW_TIMEOUT = 30000;
export const MEDIUM_TIMEOUT = 60000;
export const MAX_TIMEOUT = 120000;

export enum EvidencePathNames {
  EVIDENCE_MAY_BE_REQUIRED = 'evidence-may-be-required',
  EVIDENCE_NOT_REQUIRED = 'evidence-not-required',
  EVIDENCE_REQUIRED = 'evidence-required',
  RETURNING_CANDIDATE = 'returning-candidate',
}
