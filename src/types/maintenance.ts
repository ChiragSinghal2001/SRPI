import { ObjectType, DamageSeverity } from './inspection';

export type MaintenanceStatus = 'open' | 'in_progress' | 'done';

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  room: string;
  object: ObjectType;
  title: string;
  description: string;
  severity: DamageSeverity;
  status: MaintenanceStatus;
  estimatedCost: number;
  actualCost?: number;
  assignedVendor?: string;
  targetCompletionDate?: string;
  autoCreatedFromFindingId?: string;
  createdAt: string;
  updatedAt: string;
}
