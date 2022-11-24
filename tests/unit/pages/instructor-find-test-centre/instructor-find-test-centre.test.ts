import { PageNames } from '@constants';
import { InstructorFindTestCentreController } from '@pages/instructor-find-test-centre/instructor-find-test-centre';
import { Target, TestType } from '../../../../src/domain/enums';
import { RequestValidationError } from '../../../../src/middleware/request-validator';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'internationalised',
}));

describe('Instructor Find Test Centre controller', () => {
  let req: any;
  let res: any;
  let findTestCentreController: InstructorFindTestCentreController;

  beforeEach(() => {
    req = {
      hasErrors: false,
      query: {},
      body: {},
      errors: [],
      session: {
        testCentreSearch: {},
        target: Target.GB,
        journey: {
          support: false,
          standardAccommodation: true,
          isInstructor: true,
          receivedSupportRequestPageFlag: false,
          shownStandardSupportPageFlag: true,
        },
        currentBooking: {},
        lastPage: '',
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
    findTestCentreController = new InstructorFindTestCentreController();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('should render find-test-centre, first time', () => {
      findTestCentreController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
        backLink: 'select-standard-support',
        searchQuery: undefined,
        errors: undefined,
        noResultsError: true,
      });
    });

    test('should render find-test-centre, when revisted', () => {
      req.session.testCentreSearch.searchQuery = 'searchQuery';

      findTestCentreController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
        backLink: 'select-standard-support',
        searchQuery: 'searchQuery',
        errors: undefined,
        noResultsError: true,
      });
    });

    test('should render error if no results flag is set to true', () => {
      req.session.testCentreSearch.zeroCentreResults = true;
      req.hasErrors = true;

      findTestCentreController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
        backLink: 'select-standard-support',
        searchQuery: undefined,
        errors: [{ msg: 'internationalised', param: 'searchQuery' }],
        noResultsError: false,
      });

      expect(req.errors).toContainEqual({
        msg: 'internationalised',
        param: 'searchQuery',
      } as RequestValidationError);
    });

    describe('Back button link is generated', () => {
      test('back button takes user to select standard support', () => {
        findTestCentreController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
          backLink: 'select-standard-support',
          searchQuery: undefined,
          errors: undefined,
          noResultsError: true,
        });
      });

      test('back button takes user to test type page if in NI target', () => {
        req.session.target = Target.NI;
        findTestCentreController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
          backLink: 'test-type',
          searchQuery: undefined,
          errors: undefined,
          noResultsError: true,
        });
      });

      test('back button takes user to test type page if test type is ERS', () => {
        req.session.currentBooking.testType = TestType.ERS;
        req.session.journey.shownStandardSupportPageFlag = false;
        req.session.journey.shownVoiceoverPageFlag = true;

        findTestCentreController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
          backLink: 'change-voiceover',
          searchQuery: undefined,
          errors: undefined,
          noResultsError: true,
        });
      });

      test('back button takes user to email page when in support mode', () => {
        req.session.journey.support = true;

        findTestCentreController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
          backLink: 'nsa/email-contact',
          searchQuery: undefined,
          errors: undefined,
          noResultsError: true,
        });
      });
    });

    test('missing journey on session', () => {
      delete req.session.journey;

      expect(() => findTestCentreController.get(req, res)).toThrow(Error('InstructorFindTestCentreController::get: No journey set'));
    });

    test('missing booking on session', () => {
      delete req.session.currentBooking;

      expect(() => findTestCentreController.get(req, res)).toThrow(Error('InstructorFindTestCentreController::get: No currentBooking set'));
    });
  });

  describe('POST', () => {
    test('should redirect you to select-test-centre if POST is successful', () => {
      findTestCentreController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('select-test-centre');
    });

    test('should set the search query on the candidate session if POST is successful', () => {
      const searchQuery = 'test search query';
      req.body = { searchQuery };

      findTestCentreController.post(req, res);

      expect(req.session.testCentreSearch.searchQuery).toBe(searchQuery);
    });

    test('should return to find-test-centre with backlink as test-language and passing through the errors if request validation fails', () => {
      const errorsMock = [{ searchQuery: 'Search Term is invalid' }];
      req.hasErrors = true;
      req.errors = errorsMock;

      findTestCentreController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
        backLink: 'test-language',
        errors: errorsMock,
        noResultsError: false,
      });
    });

    test('should return to find-test-centre with backlink as email contact and passing through the errors if request validation fails while in supported standard accommodation mode', () => {
      const errorsMock = [{ searchQuery: 'Search Term is invalid' }];
      req.hasErrors = true;
      req.errors = errorsMock;
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = true;

      findTestCentreController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
        backLink: 'email-contact',
        errors: errorsMock,
        noResultsError: false,
      });
    });

    describe('Back button link is generated', () => {
      test('back button takes user to additional test language page', () => {
        const errorsMock = [{ searchQuery: 'Search Term is invalid' }];
        req.hasErrors = true;
        req.errors = errorsMock;

        findTestCentreController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_FIND_TEST_CENTRE, {
          backLink: 'test-language',
          errors: errorsMock,
          noResultsError: false,
        });
      });
    });

    test('missing journey on session', () => {
      delete req.session.journey;

      expect(() => findTestCentreController.post(req, res)).toThrow(Error('InstructorFindTestCentreController::post: No journey set'));
    });

    test('missing booking on session', () => {
      delete req.session.currentBooking;

      expect(() => findTestCentreController.post(req, res)).toThrow(Error('InstructorFindTestCentreController::post: No currentBooking set'));
    });
  });
});
