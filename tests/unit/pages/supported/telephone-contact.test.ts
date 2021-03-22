import { YES_NO } from '../../../../src/domain/enums';
import { TelephoneContactController } from '../../../../src/pages/supported/telephone-contact';

describe('Telephone contact controller', () => {
  const mockPhoneNumber = '+44 1919191919';
  let controller: TelephoneContactController;
  let req;
  let res;

  beforeEach(() => {
    controller = new TelephoneContactController();

    req = {
      session: {
        candidate: { },
      },
      hasErrors: false,
      errors: [],
      body: {
        contactByTelephone: YES_NO.YES,
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
      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith('supported/telephone-contact', {
        contactByTelephone: undefined,
        telephoneNumber: undefined,
      });
    });

    test('renders the page with saved "yes" option and phone number pre-populated', () => {
      req.session.candidate.telephone = '0123456789';

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith('supported/telephone-contact', {
        contactByTelephone: YES_NO.YES,
        telephoneNumber: '0123456789',
      });
    });

    test('renders the telephone contact page with saved "no" option pre-populated', () => {
      req.session.candidate.telephone = false;

      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith('supported/telephone-contact', {
        contactByTelephone: YES_NO.NO,
        telephoneNumber: false,
      });
    });
  });

  describe('POST request', () => {
    test('redirects to the next page', () => {
      controller.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('#');
    });

    test('sets the session if "yes" option selected and phone number entered', () => {
      controller.post(req, res);

      expect(req.session.candidate.telephone).toBe(mockPhoneNumber);
    });

    test('sets the session if "no" option selected', () => {
      req.body.contactByTelephone = YES_NO.NO;
      req.body.telephoneNumber = undefined;

      controller.post(req, res);

      expect(req.session.candidate.telephone).toBe(false);
    });

    test('re-renders the page on bad input', () => {
      req.body.contactByTelephone = YES_NO.YES;
      req.body.telephoneNumber = '';
      req.hasErrors = true;
      req.errors = ['some errors'];

      controller.post(req, res);

      expect(res.render).toHaveBeenCalledWith('supported/telephone-contact', {
        errors: req.errors,
        contactByTelephone: YES_NO.YES,
        telephoneNumber: '',
      });
    });

    describe('Conditional validation schema', () => {
      test('builds correct schema for "yes" branch', () => {
        req.body.contactByTelephone = YES_NO.YES;
        req.body.telephoneNumber = '0191919191';

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
        req.body.contactByTelephone = YES_NO.NO;

        const schema = controller.postSchemaValidation(req);

        expect(schema).toStrictEqual({
          contactByTelephone: {
            in: ['body'],
            equals: {
              options: YES_NO.NO,
              errorMessage: expect.any(Function),
            },
          },
        });
      });
    });
  });
});
