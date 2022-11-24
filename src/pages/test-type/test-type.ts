import { Request, Response } from 'express';
import { Meta } from 'express-validator';
import { PageNames } from '@constants';
import { ValidatorSchema } from '../../middleware/request-validator';
import { translate } from '../../helpers/language';
import { store } from '../../services/session';
import { existsInEnum, TestType, Target } from '../../domain/enums';
import { isNonStandardJourney, isStandardJourney, isSupportedStandardJourney } from '../../helpers/journey-helper';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { Eligibility, PriceListItem } from '../../domain/types';
import { isBookable, isInstructorBookable, isZeroCostTest } from '../../domain/eligibility';
import { fromCRMProductNumber } from '../../services/crm-gateway/maps';

interface TestItem {
  key: TestType;
  price: number | undefined;
  isCompensationBooking?: boolean;
  isZeroCostBooking?: boolean;
}

interface TestTypeBody {
  testType: TestType;
}

export class TestTypeController {
  constructor(
    private crm: CRMGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => this.renderPage(req, res);

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }
    if (!req.session.journey) {
      throw Error('TestTypeController::post: No journey set');
    }
    /* istanbul ignore next */
    if (!req.session.priceLists) {
      throw Error('TestTypeController::post: No price list set');
    }
    /* istanbul ignore next */
    if (!req.session.candidate) {
      throw Error('TestTypeController::post: No candidate set');
    }
    req.session.journey.receivedSupportRequestPageFlag = false;
    req.session.journey.shownStandardSupportPageFlag = false;
    req.session.journey.shownVoiceoverPageFlag = false;
    const { inEditMode } = req.session.journey;
    if (inEditMode) {
      if (isNonStandardJourney(req)) {
        // These fields could be long strings of text, so we want to keep these in session to avoid the candidate retyping them.
        store.resetBookingExceptSupportText(req);
      } else {
        store.resetBooking(req);
      }
      req.session.journey = {
        ...req.session.journey,
        inEditMode: false,
      };
    }
    const { testType } = req.body as TestTypeBody;

    const eligibilities = req.session.candidate.eligibilities ?? [];
    const eligibility = eligibilities.find((eligibilityObj) => eligibilityObj.testType === testType);

    const allPriceLists: PriceListItem[] = req.session.priceLists;
    const selectedPriceList = allPriceLists.find((item) => item.testType === testType);

    const compensationBookings = req.session.compensationBookings ?? [];
    const selectedCompensationBooking = compensationBookings.find((compensationBooking) => fromCRMProductNumber(compensationBooking.productNumber) === testType);

    if (!selectedPriceList) {
      throw Error(`TestTypeController::post: priceList missing for test type: ${testType}`);
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      testType,
      priceList: selectedPriceList,
      compensationBooking: selectedCompensationBooking,
      eligibility,
    };

    if (!isNonStandardJourney(req)) {
      const userDraftNSABookings = await this.crm.getUserDraftNSABookingsIfExist(req.session.candidate.candidateId as string, testType);
      if (userDraftNSABookings) {
        req.session.lastPage = 'test-type';
        return res.redirect('received-support-request');
      }
    }
    return res.redirect('test-language');
  };

  private async renderPage(req: Request, res: Response): Promise<void> {
    if (!req.session.journey) {
      throw Error('TestTypeController::renderPage: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('TestTypeController::renderPage: No currentBooking set');
    }
    if (!req.session.candidate?.candidateId) {
      throw Error('TestTypeController::renderPage: No candidate set');
    }

    const { inEditMode, isInstructor } = req.session.journey;
    const chosenTestType = req.session.currentBooking.testType;
    const target = req.session.target as Target;

    const eligibilities = req.session.candidate.eligibilities ?? [];
    let prn;
    if (isInstructor) {
      prn = target === Target.NI ? req.session.candidate.paymentReceiptNumber : req.session.candidate.personalReferenceNumber;
    }
    const bookableTestTypes = this.getBookableTestTypes(eligibilities, target, isInstructor, prn);

    const priceList: PriceListItem[] = await this.crm.getPriceList(target, bookableTestTypes);
    req.session.priceLists = priceList;

    const compensationBookings = await this.crm.getCandidateCompensatedBookings(req.session.candidate.candidateId, target);
    req.session.compensationBookings = compensationBookings;

    const tests: Map<TestType, TestItem> = new Map();
    bookableTestTypes.forEach((testType) => {
      tests.set(testType, {
        key: testType,
        price: priceList.find((item) => item.testType === testType)?.price,
        isCompensationBooking: compensationBookings ? compensationBookings.find((compensationTest) => fromCRMProductNumber(compensationTest.productNumber) === testType) !== undefined : false,
        isZeroCostBooking: isZeroCostTest(testType),
      });
    });

    let backLink;
    if (inEditMode) {
      if (isStandardJourney(req) || isSupportedStandardJourney(req)) {
        backLink = 'check-your-answers';
      } else {
        backLink = 'check-your-details';
      }
    } else {
      backLink = isNonStandardJourney(req) ? undefined : 'email-contact';
    }

    return res.render(PageNames.TEST_TYPE, {
      backLink,
      errors: req.errors,
      chosenTestType,
      tests,
    });
  }

  private getBookableTestTypes(eligibilities: Eligibility[], target: Target, isInstructor?: boolean, prn?: string): TestType[] {
    if (isInstructor) {
      if (!prn) {
        return [];
      }

      return eligibilities
        .filter((eligibility) => {
          const doesPRNMatchTestType = target === Target.NI ? eligibility.paymentReceiptNumber === prn : eligibility.personalReferenceNumber === prn;
          return isInstructorBookable(eligibility, target) && doesPRNMatchTestType;
        })
        .map((eligibility) => eligibility.testType);
    }

    return eligibilities
      .filter((eligibility) => isBookable(eligibility, target))
      .map((eligibility) => eligibility.testType);
  }

  /* istanbul ignore next */
  public postSchemaValidation: ValidatorSchema = {
    testType: {
      in: ['body'],
      errorMessage: (): string => translate('testType.validationError'),
      custom: {
        options: (value: string, { req }: Meta): boolean => {
          if (!value || !existsInEnum(TestType)(value)) {
            return false;
          }
          // Double check against eligibilities in case user 'hacks' radio input value to different test type
          const { target } = req.session;
          const { isInstructor } = req.session.journey;
          const { eligibilities } = req.session.candidate;
          let prn;
          if (isInstructor) {
            prn = target === Target.NI ? req.session.candidate.paymentReceiptNumber : req.session.candidate.personalReferenceNumber;
          }
          return this.getBookableTestTypes(eligibilities, target, isInstructor, prn).includes(value as TestType);
        },
      },
    },
  };
}

export default new TestTypeController(
  CRMGateway.getInstance(),
);
