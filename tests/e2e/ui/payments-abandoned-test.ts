import { SessionData } from '../data/session-data';
import {
  Language, Target, TestType,
} from '../../../src/domain/enums';
import { testPaymentCpms } from '../data/constants';
import { createNewBookingForPaymentsNotifications } from '../utils/crm/crm-data-helper';

fixture.skip`Payments - Abandoned payment test`
  .page(process.env.BOOKING_APP_URL)
  // eslint-disable-next-line @typescript-eslint/require-await
  .beforeEach(async (t) => {
    const sessionData = new SessionData(Target.GB);
    sessionData.journey.support = false;
    sessionData.candidate.firstnames = 'Joseph';
    sessionData.candidate.surname = 'Bloggs';
    sessionData.candidate.dateOfBirth = '1990-02-12';
    sessionData.candidate.licenceNumber = 'BLOGG902120J95YA';
    sessionData.candidate.email = 'a.hussein@kainos.com';
    sessionData.currentBooking.testType = TestType.CAR;
    sessionData.currentBooking.language = Language.ENGLISH;
    sessionData.paymentDetails = testPaymentCpms;
    t.ctx.sessionData = sessionData;
  });

const iterations = 1500;

for (let i = 0; i < iterations; i++) {
  test(`Abandoned CPMS payment test - ${i}`, async (t) => {
    const { sessionData } = t.ctx;
    await createNewBookingForPaymentsNotifications(sessionData, false);
  });
}
