import { PageNames } from '@constants';
import { InstructorTelephoneContactController } from '@pages/instructor-telephone-contact/instructor-telephone-contact';
import { YesNo } from '../../../../src/domain/enums';

describe('Instructor Telephone contact controller', () => {
  const mockPhoneNumber = '+44 1919191919';
  let controller: InstructorTelephoneContactController;
  let req;
  let res;

  beforeEach(() => {
    controller = new InstructorTelephoneContactController();

    req = {
      session: {
        candidate: { },
        currentBooking: { },
        journey: {
          inEditMode: false,
        },
      },
      hasErrors: false,
      errors: [],
      body: {
        contactByTelephone: YesNo.YES,
        telephoneNumber: mockPhoneNumber,
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders the page', () => {
      req.body.telephoneNumber = undefined;
      req.body.contactByTelephone = YesNo.NO;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TELEPHONE_CONTACT, {
        contactByTelephone: YesNo.NO,
        telephoneNumber: undefined,
        backLink: 'email-contact',
        errors: expect.any(Array),
      });
    });

    test('renders the page with saved "yes" option and phone number pre-populated', () => {
      req.session.candidate.telephone = mockPhoneNumber;
      req.body.telephoneNumber = mockPhoneNumber;
      req.body.contactByTelephone = YesNo.YES;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TELEPHONE_CONTACT, {
        contactByTelephone: YesNo.YES,
        telephoneNumber: mockPhoneNumber,
        backLink: 'email-contact',
        errors: expect.any(Array),
      });
    });

    test('renders the telephone contact page with saved "no" option pre-populated', () => {
      req.session.candidate.telephone = false;
      req.body.contactByTelephone = YesNo.NO;
      req.body.telephoneNumber = undefined;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TELEPHONE_CONTACT, {
        contactByTelephone: YesNo.NO,
        telephoneNumber: false,
        backLink: 'email-contact',
        errors: expect.any(Array),
      });
    });
  });

  describe('POST request', () => {
    test('redirects to the next page', () => {
      controller.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('voicemail');
    });

    test('sets the session if "yes" option selected and phone number entered', () => {
      controller.post(req, res);

      expect(req.session.candidate.telephone).toBe(mockPhoneNumber);
    });

    test('sets the session if "no" option selected', () => {
      req.body.contactByTelephone = YesNo.NO;
      req.body.telephoneNumber = undefined;

      controller.post(req, res);

      expect(req.session.candidate.telephone).toBe(false);
    });

    test('clears the voicemail option if "no" option selected', () => {
      req.session.currentBooking.voicemail = false;
      req.body.contactByTelephone = YesNo.NO;
      req.body.telephoneNumber = undefined;

      controller.post(req, res);

      expect(req.session.currentBooking.voicemail).toBeUndefined();
    });

    test('re-renders the page on bad input', () => {
      req.body.contactByTelephone = YesNo.YES;
      req.body.telephoneNumber = '';
      req.hasErrors = true;
      req.errors = ['some errors'];

      controller.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TELEPHONE_CONTACT, {
        errors: req.errors,
        contactByTelephone: YesNo.YES,
        telephoneNumber: '',
        backLink: 'email-contact',
      });
    });

    describe('Conditional validation schema', () => {
      test('builds correct schema for "yes" branch', () => {
        req.body.contactByTelephone = YesNo.YES;
        req.body.telephoneNumber = mockPhoneNumber;

        const schema = controller.postSchemaValidation(req);

        expect(schema).toStrictEqual({
          telephoneNumber: {
            in: ['body'],
            notEmpty: {
              errorMessage: expect.any(Function),
            },
            isLength: {
              options: { max: 50 },
              errorMessage: expect.any(Function),
            },
          },
        });
      });

      test('builds correct schema for "no" branch', () => {
        req.body.contactByTelephone = YesNo.NO;

        const schema = controller.postSchemaValidation(req);

        expect(schema).toStrictEqual({
          contactByTelephone: {
            in: ['body'],
            equals: {
              options: YesNo.NO,
              errorMessage: expect.any(Function),
            },
          },
        });
      });
    });
  });
});
