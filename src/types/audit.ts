export interface AuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: 'LANDLORD' | 'TENANT' | 'SYSTEM';
  action: string;
  details: string;
  resourceType: 'inspection' | 'dispute' | 'maintenance' | 'property' | 'auth';
  resourceId: string;
}
