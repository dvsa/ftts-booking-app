import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { Candidate, store } from '../../services/session';
import { Booking } from '../../domain/booking/booking';
import { Centre } from '../../domain/types';
import { CRMAdditionalSupport, CRMBookingStatus, CRMProductNumber } from '../../services/crm-gateway/enums';
import { mapToSupportType } from '../../services/crm-gateway/crm-helper';
import { fromCRMProductNumber } from '../../services/crm-gateway/maps';
import { BookingDetails, CRMNsaBookingSlots } from '../../services/crm-gateway/interfaces';
import { logger } from '../../helpers';
import { TestLanguage } from '../../domain/test-language';
import { TestVoiceover } from '../../domain/test-voiceover';
import { Target } from '../../domain/enums';

export class ManageBookingCheckYourDetailsController {
  public get = (req: Request, res: Response): void => this.renderPage(req, res);

  public post = (req: Request): void => {
    logger.debug('check-your-details::post: Post method is called', { // TODO FTT-19395: Remove
      request: req.body,
    });
  };

  private renderPage = (req: Request, res: Response): void => {
    // Call the store to get the manage booking bookings for the candidate (we must start in the manage booking home screen to get this)
    const {
      licenceNumber, email, telephone, dateOfBirth, surname, firstnames,
    } = req.session.manageBooking?.candidate as Candidate;
    const { target } = req.session;

    // ! START OF TEST - Remove once we have this in previous ticket (Completed as part of FTT-19136)
    const bookings = store.manageBooking.getBookings(req);
    let exampleBooking: BookingDetails | null = null;

    bookings.forEach((booking: Booking) => {
      if (booking.details.bookingStatus === CRMBookingStatus.Draft) {
        const nsaBookingSlots = booking.details.nsaBookingSlots as CRMNsaBookingSlots[];
        if (nsaBookingSlots.length > 0) {
          exampleBooking = booking.details;
        }
      }
    });

    if (exampleBooking === null) {
      throw new Error('No booking available!');
    }
    const nsaBooking = exampleBooking as BookingDetails;

    const centre: Partial<Centre> = {
      name: 'Birmingham',
      addressLine1: '155 Great Charles Street Queensway',
      addressLine2: '',
      addressCounty: 'West Midlands',
      addressCity: 'Birmingham',
      addressPostalCode: 'B3 3LP',
    };
    const testDate = '2022-11-10';
    // ! END OF TEST

    const candidateName = firstnames === '---' && target === Target.GB ? surname : `${firstnames} ${surname}`;
    const {
      reference, product, price, voiceoverLanguage, voicemailmessagespermitted, testSupportNeed, additionalSupport, foreignlanguageselected,
    } = nsaBooking;

    const testType = fromCRMProductNumber(product?.productnumber as CRMProductNumber);
    const bsl = additionalSupport === CRMAdditionalSupport.BritishSignLanguage;
    const voiceover = TestVoiceover.fromCRMVoiceover(voiceoverLanguage);
    const testLanguage = TestLanguage.fromCRMTestLanguage(nsaBooking.testLanguage);
    const supportTypes = mapToSupportType(testSupportNeed);

    return res.render(PageNames.MANAGE_BOOKING_CHECK_YOUR_DETAILS, {
      target,
      candidateName,
      dateOfBirth,
      licenceNumber,
      supportTypes,
      foreignlanguageselected,
      testLanguage,
      voiceover,
      testType,
      bsl,
      telephoneNumber: telephone,
      emailAddress: email,
      voicemail: voicemailmessagespermitted,
      bookingReference: reference,
      cost: price,
      dateTime: testDate,
      testCentre: centre,
    });
  };
}

export default new ManageBookingCheckYourDetailsController();
