import { NavigationHelper } from '../utils/navigation-helper';
import { SessionData } from '../data/session-data';
import {
  Language, Locale, SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { testPaymentCpms } from '../data/constants';

fixture.skip`Book theory tests in the NFT Environment`
  .page(process.env.BOOKING_APP_URL);

const dataSet = [
  {
    target: Target.GB,
    testType: TestType.CAR,
    licenceNumber: 'BLOGG902120J95YA',
    searchTerm: 'Nottingham',
    testCentreName: 'Nottingham',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.MOTORCYCLE,
    licenceNumber: 'BLOGG902120J94YA',
    searchTerm: 'Nottingham',
    testCentreName: 'Nottingham',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.LGVMC,
    licenceNumber: 'BLOGG902120J93YA',
    searchTerm: 'Nottingham',
    testCentreName: 'Nottingham',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.LGVHPT,
    licenceNumber: 'BLOGG902120J92YA',
    searchTerm: 'Nottingham',
    testCentreName: 'Nottingham',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.LGVCPC,
    licenceNumber: 'BLOGG902120J99XA',
    searchTerm: 'Nottingham',
    testCentreName: 'Nottingham',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.CAR,
    licenceNumber: 'BLOGG902120J98XA',
    searchTerm: 'Nottingham',
    testCentreName: 'Nottingham',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.PCVMC,
    licenceNumber: 'BLOGG902120J97XA',
    searchTerm: 'Nottingham',
    testCentreName: 'Nottingham',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.PCVHPT,
    licenceNumber: 'BLOGG902120J96XA',
    searchTerm: 'Nottingham',
    testCentreName: 'NG1 6DQ',
    testDate: '2022-06-01',
  },
  {
    target: Target.GB,
    testType: TestType.PCVCPC,
    licenceNumber: 'BLOGG902120J95XA',
    searchTerm: 'Nottingham',
    testCentreName: 'NG1 6DQ',
    testDate: '2022-06-01',
  },
];

dataSet.forEach((data) => {
  test('Book a new test', async () => {
    const sessionData = new SessionData(data.target);
    sessionData.journey.support = false;
    sessionData.candidate.firstnames = 'Joseph';
    sessionData.candidate.surname = 'Bloggs';
    sessionData.candidate.dateOfBirth = '1990-02-12';
    sessionData.candidate.licenceNumber = data.licenceNumber;
    sessionData.candidate.email = 'a.hussein@kainos.com';
    sessionData.currentBooking.testType = data.testType;
    sessionData.currentBooking.language = Language.ENGLISH;
    sessionData.testCentreSearch.searchQuery = data.searchTerm;
    sessionData.currentBooking.centre.name = data.testCentreName;
    sessionData.specificDate = true;
    sessionData.testCentreSearch.selectedDate = data.testDate;
    sessionData.currentBooking.bsl = false;
    sessionData.currentBooking.voiceover = Voiceover.NONE;
    sessionData.paymentDetails = testPaymentCpms;
    await new NavigationHelper(sessionData).createANewBooking();
  });
});

test('Book a new SA test', async () => {
  const sessionData = new SessionData(Target.GB);
  sessionData.journey.support = false;
  sessionData.candidate.firstnames = 'JVBRAXKFVPB WKVT';
  sessionData.candidate.surname = 'VAKJJ';
  sessionData.candidate.dateOfBirth = '1957-04-27';
  sessionData.candidate.licenceNumber = 'VAKJJ504277JW7GA';
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.currentBooking.testType = TestType.CAR;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.testCentreSearch.searchQuery = 'NG1 6DQ';
  sessionData.currentBooking.centre.name = 'Pearson_MO_Stand_Alone';
  sessionData.specificDate = true;
  sessionData.testCentreSearch.selectedDate = '2022-05-10';
  sessionData.currentBooking.bsl = false;
  sessionData.currentBooking.voiceover = Voiceover.NONE;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Book a new NSA test', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);
  sessionData.candidate.firstnames = 'FOSY ZRYHBPN';
  sessionData.candidate.surname = 'VAKJJ';
  sessionData.candidate.dateOfBirth = '1957-10-20';
  sessionData.candidate.licenceNumber = 'VAKJJ510207FZ9LE';
  sessionData.candidate.email = 'a.hussein@kainos.com';
  sessionData.currentBooking.testType = TestType.CAR;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.specificDate = true;
  sessionData.testCentreSearch.selectedDate = '2022-05-10';

  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.customSupport = 'Please can I wear a Pikachu costume';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  await new NavigationHelperNSA(sessionData).sendNsaBookingRequest();
});
