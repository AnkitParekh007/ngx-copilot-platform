export interface ApprovalRequest {
  id: string;
  title: string;
  reason: string;
  actionSummary: string;
  riskLevel: 'low' | 'medium' | 'high';
  decision?: 'approved' | 'rejected';
}

export type ApprovalTone = 'neutral' | 'caution' | 'critical' | 'resolved';

export function getApprovalTone(request: ApprovalRequest): ApprovalTone {
  if (request.decision) {
    return 'resolved';
  }

  switch (request.riskLevel) {
    case 'high':
      return 'critical';
    case 'medium':
      return 'caution';
    default:
      return 'neutral';
  }
}
