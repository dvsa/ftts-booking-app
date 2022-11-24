import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { ManageBookingCheckYourDetailsController } from '@pages/manage-booking-check-your-details/manage-booking-check-your-details';
import {
  CRMAdditionalSupport, CRMBookingStatus, CRMProductNumber, CRMTestLanguage, CRMTestSupportNeed, CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';
import { BookingDetails, CRMProduct } from '../../../../src/services/crm-gateway/interfaces';
import { Candidate, ManageBooking } from '../../../../src/services/session';
import { bookingDetailsBuilder, candidateBuilder } from '../../../mocks/data/builders';
import { MockRequest } from '../../../mocks/data/session';
import {
  Language, Target, TestSupportNeed, TestType, Voiceover,
} from '../../../../src/domain/enums';
import { logger } from '../../../../src/helpers';

describe('check-your-details', () => {
  const controller = new ManageBookingCheckYourDetailsController();
  const mockBooking: BookingDetails = bookingDetailsBuilder(true, CRMBookingStatus.Draft);
  const mockCandidate: Candidate = candidateBuilder();

  let req: MockRequest<any>;
  let res: Response;
  beforeEach(() => {
    req = {
      session: {
        manageBooking: {
          candidate: mockCandidate,
          bookings: [
            mockBooking,
          ],
        } as ManageBooking,
        target: Target.GB,
      },
    } as MockRequest<any>;

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response;
  });

  describe('GET', () => {
    test('when called, returns the correct booking and candidate information', () => {
      mockBooking.voiceoverLanguage = CRMVoiceOver.English;
      mockBooking.testSupportNeed = [CRMTestSupportNeed.BSLInterpreter, CRMTestSupportNeed.ExtraTime];
      mockBooking.testLanguage = CRMTestLanguage.English;
      (mockBooking.product as CRMProduct).productnumber = CRMProductNumber.CAR;
      mockBooking.additionalSupport = CRMAdditionalSupport.BritishSignLanguage;

      controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_YOUR_DETAILS, {
        target: Target.GB,
        candidateName: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
        dateOfBirth: mockCandidate.dateOfBirth,
        licenceNumber: mockCandidate.licenceNumber,
        supportTypes: [TestSupportNeed.BSLInterpreter, TestSupportNeed.ExtraTime],
        foreignlanguageselected: mockBooking.foreignlanguageselected,
        testLanguage: {
          testLanguage: Language.ENGLISH,
        },
        voiceover: Voiceover.ENGLISH,
        testType: TestType.CAR,
        bsl: true,
        telephoneNumber: mockCandidate.telephone,
        emailAddress: mockCandidate.email,
        voicemail: mockBooking.voicemailmessagespermitted,
        bookingReference: mockBooking.reference,
        cost: mockBooking.price,
        dateTime: '2022-11-10',
        testCentre: {
          name: 'Birmingham',
          addressLine1: '155 Great Charles Street Queensway',
          addressLine2: '',
          addressCounty: 'West Midlands',
          addressCity: 'Birmingham',
          addressPostalCode: 'B3 3LP',
        },
      });
    });

    test('when candidate first name returns as \'---\' and target is in gb, render page with just surname', () => {
      mockCandidate.firstnames = '---';

      controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CHECK_YOUR_DETAILS, expect.objectContaining({
        candidateName: mockCandidate.surname,
      }));
    });
  });

  describe('POST', () => {
    test('expect it to redirect to the same page', () => {
      controller.post(req as unknown as Request);

      expect(logger.debug).toHaveBeenCalled();
    });
  });
});
