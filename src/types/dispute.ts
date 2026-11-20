import { ObjectType, DamageSeverity } from './inspection';

export type DisputeStatus = 'open' | 'accepted' | 'rejected';

export interface DisputeItem {
  id: string;
  inspectionId: string;
  propertyId: string;
  propertyName: string;
  unit?: string;
  tenantId: string;
  tenantName: string;
  room: string;
  object: ObjectType;
  assessedAmount: number;
  tenantComment: string;
  counterPhotoUrl?: string;
  status: DisputeStatus;
  landlordResolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}
