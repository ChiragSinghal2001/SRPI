import { AuditEntry } from '../types/audit';
import { MOCK_AUDIT_LOGS } from './mockData';

let logs = [...MOCK_AUDIT_LOGS];

export const auditService = {
  async getLogs(filter?: { resourceType?: string; actorRole?: string }): Promise<AuditEntry[]> {
    await new Promise((res) => setTimeout(res, 250));
    let list = [...logs];
    if (filter?.resourceType) list = list.filter((l) => l.resourceType === filter.resourceType);
    if (filter?.actorRole) list = list.filter((l) => l.actorRole === filter.actorRole);
    return list;
  },

  async logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs = [newEntry, ...logs];
    return newEntry;
  },
};

export default auditService;
