import { Locale, Target } from '../../../src/domain/enums';
import { getErrorPageLink, getStartAgainLink } from '../../../src/helpers/links';

describe('links', () => {
  describe('getErrorPageLink', () => {
    let req;

    beforeEach(() => {
      req = {
        session: {},
        query: {},
        originalUrl: '',
      };
    });

    test.each([
      ['/error-technical', '/something', Target.GB, Locale.GB, '/error-technical?source=/&target=gb&lang=gb'],
      ['/error-technical', '/something', Target.GB, Locale.NI, '/error-technical?source=/&target=gb&lang=ni'],
      ['/error-technical', '/something', Target.GB, Locale.CY, '/error-technical?source=/&target=gb&lang=cy'],
      ['/error-technical', '/something', Target.NI, Locale.GB, '/error-technical?source=/&target=ni&lang=gb'],
      ['/error-technical', '/something', Target.NI, Locale.NI, '/error-technical?source=/&target=ni&lang=ni'],
      ['/error-technical', '/something', Target.NI, Locale.CY, '/error-technical?source=/&target=ni&lang=cy'],
      ['/error-technical', '/manage-booking/aaa', Target.GB, Locale.GB, '/error-technical?source=/manage-booking&target=gb&lang=gb'],
      ['/error-technical', '/manage-booking/aaa', Target.GB, Locale.NI, '/error-technical?source=/manage-booking&target=gb&lang=ni'],
      ['/error-technical', '/manage-booking/aaa', Target.GB, Locale.CY, '/error-technical?source=/manage-booking&target=gb&lang=cy'],
      ['/error-technical', '/manage-booking/aaa', Target.NI, Locale.GB, '/error-technical?source=/manage-booking&target=ni&lang=gb'],
      ['/error-technical', '/manage-booking/aaa', Target.NI, Locale.NI, '/error-technical?source=/manage-booking&target=ni&lang=ni'],
      ['/error-technical', '/manage-booking/aaa', Target.NI, Locale.CY, '/error-technical?source=/manage-booking&target=ni&lang=cy'],
      ['/error-technical', '/instructor/aaa', Target.GB, Locale.GB, '/error-technical?source=/instructor&target=gb&lang=gb'],
      ['/error-technical', '/instructor/aaa', Target.GB, Locale.NI, '/error-technical?source=/instructor&target=gb&lang=ni'],
      ['/error-technical', '/instructor/aaa', Target.GB, Locale.CY, '/error-technical?source=/instructor&target=gb&lang=cy'],
      ['/error-technical', '/instructor/aaa', Target.NI, Locale.GB, '/error-technical?source=/instructor&target=ni&lang=gb'],
      ['/error-technical', '/instructor/aaa', Target.NI, Locale.NI, '/error-technical?source=/instructor&target=ni&lang=ni'],
      ['/error-technical', '/instructor/aaa', Target.NI, Locale.CY, '/error-technical?source=/instructor&target=ni&lang=cy'],
    ])('for given request return correct link', (dest: string, originalUrl: string, target: Target, locale: Locale, expectedLink: string) => {
      req.originalUrl = originalUrl;
      req.session.target = target;
      req.session.locale = locale;

      expect(getErrorPageLink(dest, req)).toEqual(expectedLink);
    });
  });

  describe('getStartAgainLink', () => {
    test.each([
      [Target.GB, Locale.GB, 'something', '/choose-support?target=gb&lang=gb'],
      [Target.GB, Locale.NI, 'something', '/choose-support?target=gb&lang=ni'],
      [Target.GB, Locale.CY, 'something', '/choose-support?target=gb&lang=cy'],
      [Target.NI, Locale.GB, 'something', '/choose-support?target=ni&lang=gb'],
      [Target.NI, Locale.NI, 'something', '/choose-support?target=ni&lang=ni'],
      [Target.NI, Locale.CY, 'something', '/choose-support?target=ni&lang=cy'],
      [Target.GB, Locale.GB, '/manage-booking/aaa', '/manage-booking?target=gb&lang=gb'],
      [Target.GB, Locale.NI, '/manage-booking/aaa', '/manage-booking?target=gb&lang=ni'],
      [Target.GB, Locale.CY, '/manage-booking/aaa', '/manage-booking?target=gb&lang=cy'],
      [Target.NI, Locale.GB, '/manage-booking/aaa', '/manage-booking?target=ni&lang=gb'],
      [Target.NI, Locale.NI, '/manage-booking/aaa', '/manage-booking?target=ni&lang=ni'],
      [Target.NI, Locale.CY, '/manage-booking/aaa', '/manage-booking?target=ni&lang=cy'],
      [Target.GB, Locale.GB, '/instructor/aaa', '/instructor?target=gb&lang=gb'],
      [Target.GB, Locale.NI, '/instructor/aaa', '/instructor?target=gb&lang=ni'],
      [Target.GB, Locale.CY, '/instructor/aaa', '/instructor?target=gb&lang=cy'],
      [Target.NI, Locale.GB, '/instructor/aaa', '/instructor?target=ni&lang=gb'],
      [Target.NI, Locale.NI, '/instructor/aaa', '/instructor?target=ni&lang=ni'],
      [Target.NI, Locale.CY, '/instructor/aaa', '/instructor?target=ni&lang=cy'],
    ])('return correct link for given arguments', (target: Target, lang: Locale, source: string, expectedLink: string) => {
      expect(getStartAgainLink(target, lang, source)).toEqual(expectedLink);
    });
  });
});
