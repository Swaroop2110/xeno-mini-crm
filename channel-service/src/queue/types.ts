export interface CommunicationPayload {
  communicationId: string;
  campaignId: string;
  customerId: string;
  channel: string;
  message: string;
}

export interface DispatchRequest {
  campaignId: string;
  communications: CommunicationPayload[];
}

export type Status = 'queued' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'converted';

export interface ReceiptPayload {
  communicationId: string;
  campaignId: string;
  customerId: string;
  status: Status;
  timestamp: string;
  idempotencyKey: string;
}
