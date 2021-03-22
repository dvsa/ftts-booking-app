import dayjs from 'dayjs';
import cy from 'dayjs/locale/cy';
import gb from 'dayjs/locale/en-gb';
import i18next from 'i18next';

import { changeLanguage, translate } from '../../../src/helpers/language';

jest.mock('i18next');
jest.mock('dayjs');

describe('Language helper', () => {
  describe('Change language', () => {
    let req;
    let res;

    beforeEach(() => {
      req = {
        session: {},
      };
      res = {
        locals: {},
      };
    });

    test('Setting language to CY', () => {
      req.session.locale = 'cy';

      changeLanguage(req, res);

      expect(dayjs.locale).toHaveBeenCalledWith(cy);
      expect(res.locals.t).toBeDefined();
    });

    test('Setting language to EN', () => {
      req.session.locale = 'en';

      changeLanguage(req, res);

      expect(dayjs.locale).toHaveBeenCalledWith(gb);
      expect(res.locals.t).toBeDefined();
    });
  });

  describe('Translate', () => {
    test('translate wired up', () => {
      translate('test');
      expect(i18next.t).toHaveBeenCalledWith('test');
    });
  });
});
