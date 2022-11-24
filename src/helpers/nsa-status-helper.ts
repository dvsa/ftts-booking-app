import { CRMNsaStatus, NsaStatus } from '../services/crm-gateway/enums';

export function mapCRMNsaStatusToNSAStatus(CrmNsaStatus: CRMNsaStatus): NsaStatus {
  switch (CrmNsaStatus) {
    case CRMNsaStatus.AwaitingCandidateInitialReply: return NsaStatus.AwaitingCandidateInitialReply;
    case CRMNsaStatus.AwaitingCandidateMedicalEvidence: return NsaStatus.AwaitingCandidateMedicalEvidence;
    case CRMNsaStatus.AwaitingCandidateResponse: return NsaStatus.AwaitingCandidateResponse;
    case CRMNsaStatus.AwaitingCandidateSlotConfirmation: return NsaStatus.AwaitingCandidateSlotConfirmation;
    case CRMNsaStatus.AwaitingCscResponse: return NsaStatus.AwaitingCscResponse;
    case CRMNsaStatus.AwaitingPartnerResponse: return NsaStatus.AwaitingPartnerResponse;
    case CRMNsaStatus.DuplicationsClosed: return NsaStatus.DuplicationsClosed;
    case CRMNsaStatus.EscalatedToNationalOperations: return NsaStatus.EscalatedToNationalOperations;
    case CRMNsaStatus.EscalatedToTestContent: return NsaStatus.EscalatedToTestContent;
    case CRMNsaStatus.NoLongerRequired: return NsaStatus.NoLongerRequired;
    default: return NsaStatus.StandardTestBooked;
  }
}
