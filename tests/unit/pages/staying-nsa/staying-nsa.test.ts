import { StayingNSAController } from '@pages/staying-nsa/staying-nsa';
import { PageNames } from '@constants';
import { SupportType } from '../../../../src/domain/enums';
import * as EVIDENCE_HELPER from '../../../../src/helpers/evidence-helper';
import * as CRM_HELPER from '../../../../src/services/crm-gateway/crm-helper';

describe('StayingNSAController', () => {
  let stayingNSAController: StayingNSAController;
  let request;
  let response;

  const mockCrmGateway = {
    doesUserHaveDraftNSABooking: jest.fn(),
    getUserDraftNSABookingsIfExist: jest.fn(),
    hasCRMSupportNeeds: jest.fn(),
  };

  beforeEach(() => {
    stayingNSAController = new StayingNSAController(mockCrmGateway as any);
    request = {
      session: {
        currentBooking: {
          selectSupportType: [SupportType.BSL_INTERPRETER],
        },
      },
      path: '/nsa/staying-nsa',
    };
    response = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    describe('renders the correct page', () => {
      test.each([
        PageNames.EVIDENCE_REQUIRED,
        PageNames.EVIDENCE_NOT_REQUIRED,
        PageNames.EVIDENCE_MAY_BE_REQUIRED,
        PageNames.RETURNING_CANDIDATE,
      ])('when determineEvidenceRoute() returns path "%s" then renders that route', async (view: Views) => {
        jest.spyOn(EVIDENCE_HELPER, 'determineEvidenceRoute').mockReturnValue(view);
        jest.spyOn(CRM_HELPER, 'hasCRMSupportNeeds').mockReturnValue(false);

        await stayingNSAController.get(request, response);

        expect(response.render).toHaveBeenCalledWith(view, {
          backLink: 'select-support-type',
          showExtraContent: false,
        });
      });

      test('determineEvidenceRoute() is called with the correct values', async () => {
        jest.spyOn(CRM_HELPER, 'hasCRMSupportNeeds').mockReturnValue(false);
        EVIDENCE_HELPER.determineEvidenceRoute = jest.fn().mockReturnValue(PageNames.EVIDENCE_REQUIRED);
        request.session.currentBooking.selectSupportType = [SupportType.EXTRA_TIME];

        await stayingNSAController.get(request, response);

        expect(EVIDENCE_HELPER.determineEvidenceRoute).toHaveBeenCalledWith([SupportType.EXTRA_TIME], false);
        expect(EVIDENCE_HELPER.determineEvidenceRoute).toHaveBeenCalledTimes(1);
        expect(response.render).toHaveBeenCalledWith(PageNames.EVIDENCE_REQUIRED, {
          backLink: 'select-support-type',
          showExtraContent: false,
        });
        expect(request.session.currentBooking.hasSupportNeedsInCRM).toBeFalsy();
      });

      test('sets the crm support need field in the session as true when the user has support', async () => {
        jest.spyOn(CRM_HELPER, 'hasCRMSupportNeeds').mockReturnValue(true);

        await stayingNSAController.get(request, response);

        expect(request.session.currentBooking.hasSupportNeedsInCRM).toBeTruthy();
      });

      test('throws error if the current booking has not been set', async () => {
        delete request.session.currentBooking;

        await expect(stayingNSAController.get(request, response)).rejects.toThrow('StayingNSAController::get: No currentBooking set');
      });

      test('if user already has NSA request should redirect to duplicate-support-request', async () => {
        mockCrmGateway.getUserDraftNSABookingsIfExist.mockResolvedValue([true]);

        await stayingNSAController.get(request, response);

        expect(response.redirect).toHaveBeenCalledWith('duplicate-support-request');
      });

      test.each([
        [[SupportType.BSL_INTERPRETER], false],
        [[SupportType.EXTRA_TIME], false],
        [[SupportType.BSL_INTERPRETER, SupportType.EXTRA_TIME], true],
        [[SupportType.ON_SCREEN_BSL], false],
        [[SupportType.ON_SCREEN_BSL, SupportType.EXTRA_TIME], true],
      ])('showExtraContent param is calculated and passed to view', async (selectedSupportOptions: SupportType[], expectedShowExtraContent: boolean) => {
        jest.spyOn(CRM_HELPER, 'hasCRMSupportNeeds').mockReturnValue(false);
        EVIDENCE_HELPER.determineEvidenceRoute = jest.fn().mockReturnValue(PageNames.EVIDENCE_REQUIRED);
        request.session.currentBooking.selectSupportType = selectedSupportOptions;

        await stayingNSAController.get(request, response);

        expect(response.render).toHaveBeenCalledWith(PageNames.EVIDENCE_REQUIRED, {
          backLink: 'select-support-type',
          showExtraContent: expectedShowExtraContent,
        });
      });
    });

    describe('error handling', () => {
      test.each([undefined, null, ' ', [], {}])('throws error if no support options provided', async (emptyValue) => {
        request.session.currentBooking.selectSupportType = emptyValue;
        await expect(stayingNSAController.get(request, response))
          .rejects
          .toThrow(Error('StayingNSAController::getSelectedSupportOptions: No support options provided'));
      });
    });
  });
});
