import * as i18n from '../../../src/middleware/internationalisation';
import { LOCALE } from '../../../src/domain/enums';
import * as changeLanguage from '../../../src/helpers/language';

jest.mock('../../../src/helpers/language');

describe('Internationalisation middleware', () => {
  test('Middleware succeeds', () => {
    const req = {
      query: {
        lang: LOCALE.NI,
      },
      session: { locale: LOCALE.GB },
    };
    const res = {
      locals: {
        t: null,
      },
    };
    const next = jest.fn();

    i18n.internationalisation(req as any, res as any, next as any);

    expect(changeLanguage.changeLanguage).toHaveBeenCalledWith(req, res);
    expect(next).toHaveBeenCalled();
    expect(req.session.locale).toBe(LOCALE.NI);
  });
});
