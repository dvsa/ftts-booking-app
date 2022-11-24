import { mapCRMNsaStatusToNSAStatus } from '../../../src/helpers';
import { CRMNsaStatus, NsaStatus } from '../../../src/services/crm-gateway/enums';

describe('Nsa Status Helper', () => {
  describe('mapCRMNsaStatusToNSAStatus', () => {
    test.each([
      [CRMNsaStatus.AwaitingCandidateInitialReply, NsaStatus.AwaitingCandidateInitialReply],
      [CRMNsaStatus.AwaitingCandidateMedicalEvidence, NsaStatus.AwaitingCandidateMedicalEvidence],
      [CRMNsaStatus.AwaitingCandidateResponse, NsaStatus.AwaitingCandidateResponse],
      [CRMNsaStatus.AwaitingCandidateSlotConfirmation, NsaStatus.AwaitingCandidateSlotConfirmation],
      [CRMNsaStatus.AwaitingCscResponse, NsaStatus.AwaitingCscResponse],
      [CRMNsaStatus.AwaitingPartnerResponse, NsaStatus.AwaitingPartnerResponse],
      [CRMNsaStatus.DuplicationsClosed, NsaStatus.DuplicationsClosed],
      [CRMNsaStatus.EscalatedToNationalOperations, NsaStatus.EscalatedToNationalOperations],
      [CRMNsaStatus.EscalatedToTestContent, NsaStatus.EscalatedToTestContent],
      [CRMNsaStatus.NoLongerRequired, NsaStatus.NoLongerRequired],
      [CRMNsaStatus.StandardTestBooked, NsaStatus.StandardTestBooked],
    ])('Map CRM NSA status %s to regular NSA status %s', (crmNsaStatus, expectedNsaStatus) => {
      expect(mapCRMNsaStatusToNSAStatus(crmNsaStatus)).toEqual(expectedNsaStatus);
    });
  });
});
