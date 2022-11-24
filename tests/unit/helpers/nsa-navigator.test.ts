import { SupportType } from '../../../src/domain/enums';
import { NSANavigator } from '../../../src/helpers/nsa-navigator';

describe('NSA Navigator', () => {
  let nsaNavigator: NSANavigator;
  let req;

  beforeEach(() => {
    nsaNavigator = new NSANavigator();
    req = {
      session: {
        currentBooking: {
          selectSupportType: jest.fn(),
        },
      },
      path: jest.fn(),
    };
  });

  test('can navigate to next page', () => {
    req.path = 'nsa/select-support-type';
    req.session.currentBooking.selectSupportType = [SupportType.VOICEOVER];

    const nextPage = nsaNavigator.getNextPage(req);

    expect(nextPage).toStrictEqual('change-voiceover');
  });

  test('can navigate to previous page', () => {
    req.path = '/nsa/change-voiceover';
    req.session.currentBooking.selectSupportType = [SupportType.VOICEOVER];

    const nextPage = nsaNavigator.getPreviousPage(req);

    expect(nextPage).toStrictEqual('select-support-type');
  });

  describe('mixed NSA journey', () => {
    test('DVSA mixed NSA Journey', () => {
      req.session.currentBooking.selectSupportType = [
        SupportType.BSL_INTERPRETER,
        SupportType.VOICEOVER,
        SupportType.EXTRA_TIME,
        SupportType.QUESTION_MODIFIER,
        SupportType.READING_SUPPORT,
        SupportType.OTHER,
      ];

      req.path = 'nsa/select-support-type';
      const firstNextPage = nsaNavigator.getNextPage(req);

      req.path = '/nsa/change-voiceover';
      const secondNextPage = nsaNavigator.getNextPage(req);
      const secondPreviousPage = nsaNavigator.getPreviousPage(req);

      req.path = '/nsa/custom-support';
      const thirdNextPage = nsaNavigator.getNextPage(req);
      const thirdPreviousPage = nsaNavigator.getPreviousPage(req);

      req.path = '/nsa/staying-nsa';
      const fourthPreviousPage = nsaNavigator.getPreviousPage(req);

      expect(firstNextPage).toStrictEqual('change-voiceover');
      expect(secondNextPage).toStrictEqual('custom-support');
      expect(thirdNextPage).toStrictEqual('staying-nsa');

      expect(fourthPreviousPage).toStrictEqual('custom-support');
      expect(thirdPreviousPage).toStrictEqual('change-voiceover');
      expect(secondPreviousPage).toStrictEqual('select-support-type');
    });

    test('DVA mixed NSA Journey', () => {
      req.session.currentBooking.selectSupportType = [
        SupportType.BSL_INTERPRETER,
        SupportType.VOICEOVER,
        SupportType.TRANSLATOR,
        SupportType.EXTRA_TIME,
        SupportType.QUESTION_MODIFIER,
        SupportType.READING_SUPPORT,
        SupportType.OTHER,
      ];

      req.path = 'nsa/select-support-type';
      const firstNextPage = nsaNavigator.getNextPage(req);

      req.path = '/nsa/change-voiceover';
      const secondNextPage = nsaNavigator.getNextPage(req);
      const secondPreviousPage = nsaNavigator.getPreviousPage(req);

      req.path = '/nsa/translator';
      const thirdNextPage = nsaNavigator.getNextPage(req);
      const thirdPreviousPage = nsaNavigator.getPreviousPage(req);

      req.path = '/nsa/custom-support';
      const fourthNextPage = nsaNavigator.getNextPage(req);
      const fourthPreviousPage = nsaNavigator.getPreviousPage(req);

      req.path = '/nsa/staying-nsa';
      const fifthPreviousPage = nsaNavigator.getPreviousPage(req);

      expect(firstNextPage).toStrictEqual('change-voiceover');
      expect(secondNextPage).toStrictEqual('translator');
      expect(thirdNextPage).toStrictEqual('custom-support');
      expect(fourthNextPage).toStrictEqual('staying-nsa');

      expect(fifthPreviousPage).toStrictEqual('custom-support');
      expect(fourthPreviousPage).toStrictEqual('translator');
      expect(thirdPreviousPage).toStrictEqual('change-voiceover');
      expect(secondPreviousPage).toStrictEqual('select-support-type');
    });
  });

  test('navigator skips out unchecked pages', () => {
    req.session.currentBooking.selectSupportType = [SupportType.OTHER];

    req.path = 'nsa/select-support-type';
    const customSupportPage = nsaNavigator.getNextPage(req);

    req.path = '/nsa/custom-support';
    const supportTypePage = nsaNavigator.getPreviousPage(req);

    expect(customSupportPage).toStrictEqual('custom-support');
    expect(supportTypePage).toStrictEqual('select-support-type');
  });

  describe('end of dynamic journey - standard accommodations only goes to leaving-nsa', () => {
    test('bsl only', () => {
      req.session.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL];

      req.path = '/nsa/select-support-types';
      const leavingNSA = nsaNavigator.getNextPage(req);

      expect(leavingNSA).toStrictEqual('leaving-nsa');
    });

    test('bsl and voiceover', () => {
      req.session.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL, SupportType.VOICEOVER];

      req.path = '/nsa/change-voiceover';
      const leavingNSA = nsaNavigator.getNextPage(req);

      expect(leavingNSA).toStrictEqual('leaving-nsa');
    });
  });

  test('end of dynamic journey -  mixed SA and NSA goes to staying-nsa', () => {
    req.session.currentBooking.selectSupportType = [SupportType.BSL_INTERPRETER, SupportType.VOICEOVER];

    req.path = '/nsa/change-voiceover';
    const leavingNSA = nsaNavigator.getNextPage(req);

    expect(leavingNSA).toStrictEqual('staying-nsa');
  });
});
