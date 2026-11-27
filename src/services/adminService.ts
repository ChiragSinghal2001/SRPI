import { apiClient, USE_MOCK } from './api';
import { propertyService } from './propertyService';
import {
  AdminUser,
  AdminUserCreateInput,
  PropertyAdmin,
  InspectionReportAdmin,
  AiJobAdmin,
  DisputeAdmin,
  AuditLogAdmin,
  SystemSettings,
  AdminStats,
} from '../schemas/adminSchemas';
import {
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_PROPERTIES,
  MOCK_ADMIN_REPORTS,
  MOCK_ADMIN_AI_JOBS,
  MOCK_ADMIN_DISPUTES,
  MOCK_ADMIN_AUDIT_LOGS,
  MOCK_ADMIN_SETTINGS,
  MOCK_ADMIN_STATS,
} from './mockAdminData';

// Mutable in-memory state for mock mode
let users: AdminUser[] = [...MOCK_ADMIN_USERS];
let properties: PropertyAdmin[] = [...MOCK_ADMIN_PROPERTIES];
let reports: InspectionReportAdmin[] = [...MOCK_ADMIN_REPORTS];
let aiJobs: AiJobAdmin[] = [...MOCK_ADMIN_AI_JOBS];
let disputes: DisputeAdmin[] = [...MOCK_ADMIN_DISPUTES];
let auditLogs: AuditLogAdmin[] = [...MOCK_ADMIN_AUDIT_LOGS];
let settings: SystemSettings = { ...MOCK_ADMIN_SETTINGS };

const logAdminAction = (action: string, resourceType: string, resourceId: string, details?: string) => {
  const newLog: AuditLogAdmin = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: 'usr_admin_1',
    user_name: 'System Administrator',
    user_email: 'admin@srpi.test',
    role: 'admin',
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: '127.0.0.1',
    details,
    created_at: new Date().toISOString(),
  };
  auditLogs = [newLog, ...auditLogs];
};

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

const syncPropertiesFromStorage = async () => {
  try {
    const stored = await propertyService.getAllProperties();
    for (const sp of stored) {
      const idx = properties.findIndex((p) => p.id === sp.id);
      if (idx !== -1) {
        if (sp.genuinenessStatus) {
          properties[idx].genuineness_status = sp.genuinenessStatus;
        }
        if (sp.verifiedDeedHash) {
          properties[idx].verified_deed_hash = sp.verifiedDeedHash;
        }
      } else {
        const adminProp: PropertyAdmin = {
          id: sp.id,
          name: sp.name,
          address: sp.address,
          city: sp.city,
          state: sp.state,
          zip: sp.zip,
          unit: sp.unit,
          landlord_id: sp.landlordId || 'usr_landlord_1',
          landlord_name: sp.landlordName || 'Landlord',
          landlord_email: sp.landlordEmail || 'landlord@srpi.test',
          tenant_id: sp.currentTenant?.id,
          tenant_name: sp.currentTenant?.name,
          tenant_email: sp.currentTenant?.email,
          monthly_rent: sp.monthlyRent || sp.currentTenant?.monthlyRent || 0,
          security_deposit: sp.securityDeposit || sp.currentTenant?.depositAmount || 0,
          inspections_count: 0,
          last_inspection_date: undefined,
          genuineness_status: sp.genuinenessStatus || 'pending_check',
          verified_deed_hash: sp.verifiedDeedHash,
          status: sp.status,
          created_at: sp.createdAt,
        };
        properties = [adminProp, ...properties];
      }
    }
  } catch {
    // Ignore storage sync failure in pure mock
  }
};

export const adminService = {
  // 1. Dashboard Stats
  async getAdminStats(): Promise<AdminStats> {
    if (!USE_MOCK) {
      const res = await apiClient.get<AdminStats>('/admin/stats');
      return res.data;
    }
    await syncPropertiesFromStorage();
    await new Promise((r) => setTimeout(r, 200));
    return {
      ...MOCK_ADMIN_STATS,
      total_users: users.length,
      landlords_count: users.filter((u) => u.role === 'landlord').length,
      tenants_count: users.filter((u) => u.role === 'tenant').length,
      properties_count: properties.length,
      finalised_reports_count: reports.filter((r) => r.status === 'finalised').length,
      open_disputes_count: disputes.filter((d) => d.status === 'open').length,
      ai_jobs_queued: aiJobs.filter((j) => j.status === 'queued').length,
      ai_jobs_running: aiJobs.filter((j) => j.status === 'running').length,
      ai_jobs_failed: aiJobs.filter((j) => j.status === 'failed').length,
    };
  },

  // 2. Users Management
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<AdminUser>> {
    if (!USE_MOCK) {
      const res = await apiClient.get<PaginatedResult<AdminUser>>('/admin/users', { params });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    let filtered = [...users];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.company && u.company.toLowerCase().includes(q))
      );
    }
    if (params?.role && params.role !== 'all') {
      filtered = filtered.filter((u) => u.role === params.role);
    }
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    const items = filtered.slice(start, start + page_size);

    return {
      items,
      total: filtered.length,
      page,
      page_size,
    };
  },

  async getUser(id: string): Promise<AdminUser> {
    if (!USE_MOCK) {
      const res = await apiClient.get<AdminUser>(`/admin/users/${id}`);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 150));
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error(`User with ID ${id} not found`);
    return { ...user };
  },

  async createUser(data: AdminUserCreateInput): Promise<AdminUser> {
    if (!USE_MOCK) {
      const res = await apiClient.post<AdminUser>('/admin/users', data);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 250));
    const newUser: AdminUser = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'active',
      phone: data.phone || '+1 (555) 000-0000',
      company: data.company,
      properties_count: 0,
      created_at: new Date().toISOString(),
      last_login: undefined,
    };
    users = [newUser, ...users];
    logAdminAction('USER_CREATE', 'USER', newUser.id, `Created ${data.role} user ${data.email}`);
    return newUser;
  },

  async updateUserStatus(
    id: string,
    status: 'active' | 'suspended',
    reason?: string
  ): Promise<AdminUser> {
    if (!USE_MOCK) {
      const res = await apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { status, reason });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    users[idx] = {
      ...users[idx],
      status,
      suspension_reason: status === 'suspended' ? reason : undefined,
      updated_at: new Date().toISOString(),
    };
    logAdminAction(
      status === 'suspended' ? 'USER_SUSPEND' : 'USER_REACTIVATE',
      'USER',
      id,
      reason ? `Reason: ${reason}` : `Status changed to ${status}`
    );
    return { ...users[idx] };
  },

  async updateUserRole(id: string, role: 'landlord' | 'tenant'): Promise<AdminUser> {
    if (!USE_MOCK) {
      const res = await apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const oldRole = users[idx].role;
    users[idx] = {
      ...users[idx],
      role,
      updated_at: new Date().toISOString(),
    };
    logAdminAction('USER_ROLE_CHANGE', 'USER', id, `Changed role from ${oldRole} to ${role}`);
    return { ...users[idx] };
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    if (!USE_MOCK) {
      await apiClient.delete(`/admin/users/${id}`);
      return { success: true };
    }
    await new Promise((r) => setTimeout(r, 200));
    const user = users.find((u) => u.id === id);
    users = users.filter((u) => u.id !== id);
    logAdminAction('USER_DELETE', 'USER', id, `Deleted user ${user?.email || id}`);
    return { success: true };
  },

  // 3. Properties Overview & Genuineness Verification
  async getProperties(params?: {
    search?: string;
    status?: string;
    genuineness?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<PropertyAdmin>> {
    if (!USE_MOCK) {
      const res = await apiClient.get<PaginatedResult<PropertyAdmin>>('/admin/properties', { params });
      return res.data;
    }
    await syncPropertiesFromStorage();
    await new Promise((r) => setTimeout(r, 200));
    let filtered = [...properties];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.landlord_name.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.genuineness && params.genuineness !== 'all') {
      filtered = filtered.filter((p) => p.genuineness_status === params.genuineness);
    }

    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    const items = filtered.slice(start, start + page_size);

    return {
      items,
      total: filtered.length,
      page,
      page_size,
    };
  },

  async verifyPropertyGenuineness(
    id: string,
    status: 'verified' | 'flagged_discrepancy'
  ): Promise<PropertyAdmin> {
    if (!USE_MOCK) {
      const res = await apiClient.patch<PropertyAdmin>(`/admin/properties/${id}/genuineness`, {
        status,
      });
      return res.data;
    }
    await syncPropertiesFromStorage();
    await new Promise((r) => setTimeout(r, 250));
    const idx = properties.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Property not found');
    const deedHash =
      status === 'verified'
        ? `rec_${Date.now()}_sha256_cadastral_registry_ok`
        : undefined;
    properties[idx] = {
      ...properties[idx],
      genuineness_status: status,
      verified_deed_hash: deedHash,
    };
    logAdminAction(
      'PROPERTY_GENUINENESS_VERIFIED',
      'PROPERTY',
      id,
      `Property genuineness set to: ${status}. Deed hash: ${deedHash || 'none'}`
    );
    // Sync to propertyService / properties.json so prospective tenants see the verified property immediately!
    try {
      await propertyService.verifyPropertyGenuineness(id, status);
    } catch {
      // ignore
    }
    return { ...properties[idx] };
  },

  // 4. Inspections & Reports with SHA-256 Tamper Re-verification
  async getReports(params?: {
    search?: string;
    integrity?: string;
    type?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<InspectionReportAdmin>> {
    if (!USE_MOCK) {
      const res = await apiClient.get<PaginatedResult<InspectionReportAdmin>>('/admin/reports', {
        params,
      });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    let filtered = [...reports];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.property_name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.report_hash.toLowerCase().includes(q)
      );
    }
    if (params?.integrity && params.integrity !== 'all') {
      filtered = filtered.filter((r) => r.integrity_status === params.integrity);
    }
    if (params?.type && params.type !== 'all') {
      filtered = filtered.filter((r) => r.type === params.type);
    }

    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    const items = filtered.slice(start, start + page_size);

    return {
      items,
      total: filtered.length,
      page,
      page_size,
    };
  },

  async verifyReport(
    id: string
  ): Promise<{ is_valid: boolean; computed_hash: string; stored_hash: string }> {
    if (!USE_MOCK) {
      const res = await apiClient.get<{
        is_valid: boolean;
        computed_hash: string;
        stored_hash: string;
      }>(`/reports/${id}/verify`);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 350));
    const rep = reports.find((r) => r.id === id);
    if (!rep) throw new Error(`Report ${id} not found`);

    const isValid = rep.report_hash === rep.expected_hash;
    logAdminAction(
      isValid ? 'REPORT_INTEGRITY_VERIFIED' : 'REPORT_INTEGRITY_MISMATCH_DETECTED',
      'INSPECTION_REPORT',
      id,
      isValid
        ? 'SHA-256 integrity re-verified successfully against ledger.'
        : `TAMPER DETECTED: Hash mismatch! Stored: ${rep.report_hash.slice(0, 10)}... Expected: ${rep.expected_hash.slice(0, 10)}...`
    );

    return {
      is_valid: isValid,
      computed_hash: rep.expected_hash,
      stored_hash: rep.report_hash,
    };
  },

  // 5. AI Jobs Monitor
  async getAiJobs(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<AiJobAdmin>> {
    if (!USE_MOCK) {
      const res = await apiClient.get<PaginatedResult<AiJobAdmin>>('/admin/ai-jobs', { params });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    let filtered = [...aiJobs];

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((j) => j.status === params.status);
    }

    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    const items = filtered.slice(start, start + page_size);

    return {
      items,
      total: filtered.length,
      page,
      page_size,
    };
  },

  async retryAiJob(id: string): Promise<AiJobAdmin> {
    if (!USE_MOCK) {
      const res = await apiClient.post<AiJobAdmin>(`/admin/ai-jobs/${id}/retry`);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 300));
    const idx = aiJobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error('AI Job not found');

    aiJobs[idx] = {
      ...aiJobs[idx],
      status: 'running',
      progress: 10,
      error_message: undefined,
      started_at: new Date().toISOString(),
    };

    logAdminAction('AI_JOB_RETRY', 'AI_JOB', id, `Admin triggered retry for session ${aiJobs[idx].session_id}`);
    return { ...aiJobs[idx] };
  },

  // 6. Disputes Oversight
  async getDisputes(params?: {
    status?: string;
    escalated_only?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<DisputeAdmin>> {
    if (!USE_MOCK) {
      const res = await apiClient.get<PaginatedResult<DisputeAdmin>>('/admin/disputes', { params });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    let filtered = [...disputes];

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((d) => d.status === params.status);
    }
    if (params?.escalated_only) {
      filtered = filtered.filter((d) => d.is_escalated);
    }

    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    const items = filtered.slice(start, start + page_size);

    return {
      items,
      total: filtered.length,
      page,
      page_size,
    };
  },

  async addDisputeNote(id: string, note: string): Promise<DisputeAdmin> {
    if (!USE_MOCK) {
      const res = await apiClient.post<DisputeAdmin>(`/admin/disputes/${id}/notes`, { note });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    const idx = disputes.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Dispute not found');

    const newNote = {
      id: `note_${Date.now()}`,
      author: 'System Admin',
      note,
      created_at: new Date().toISOString(),
    };

    disputes[idx] = {
      ...disputes[idx],
      internal_notes: [...disputes[idx].internal_notes, newNote],
    };

    logAdminAction('DISPUTE_ADD_NOTE', 'DISPUTE', id, `Added internal note: "${note.slice(0, 40)}..."`);
    return { ...disputes[idx] };
  },

  async escalateDispute(id: string): Promise<DisputeAdmin> {
    if (!USE_MOCK) {
      const res = await apiClient.post<DisputeAdmin>(`/admin/disputes/${id}/escalate`);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    const idx = disputes.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Dispute not found');

    const nextState = !disputes[idx].is_escalated;
    disputes[idx] = {
      ...disputes[idx],
      is_escalated: nextState,
    };

    logAdminAction(
      nextState ? 'DISPUTE_ESCALATE' : 'DISPUTE_DEESCALATE',
      'DISPUTE',
      id,
      `Dispute escalation toggled to ${nextState}`
    );
    return { ...disputes[idx] };
  },

  // 7. Audit Log
  async getAuditLogs(params?: {
    user?: string;
    action?: string;
    resource_type?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResult<AuditLogAdmin>> {
    if (!USE_MOCK) {
      const res = await apiClient.get<PaginatedResult<AuditLogAdmin>>('/admin/audit-logs', { params });
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    let filtered = [...auditLogs];

    if (params?.user && params.user !== 'all') {
      filtered = filtered.filter((l) => l.user_email === params.user || l.user_id === params.user);
    }
    if (params?.action && params.action !== 'all') {
      filtered = filtered.filter((l) => l.action.includes(params.action!));
    }
    if (params?.resource_type && params.resource_type !== 'all') {
      filtered = filtered.filter((l) => l.resource_type === params.resource_type);
    }

    const page = params?.page || 1;
    const page_size = params?.page_size || 15;
    const start = (page - 1) * page_size;
    const items = filtered.slice(start, start + page_size);

    return {
      items,
      total: filtered.length,
      page,
      page_size,
    };
  },

  // 8. System Settings
  async getSettings(): Promise<SystemSettings> {
    if (!USE_MOCK) {
      const res = await apiClient.get<SystemSettings>('/admin/settings');
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 150));
    return { ...settings };
  },

  async updateSettings(data: SystemSettings): Promise<SystemSettings> {
    if (!USE_MOCK) {
      const res = await apiClient.put<SystemSettings>('/admin/settings', data);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 300));
    const old = { ...settings };
    settings = { ...data };

    logAdminAction(
      'SETTINGS_UPDATE',
      'SYSTEM_SETTINGS',
      'sys_config',
      `Updated settings. Confidence threshold: ${old.ai_confidence_threshold} -> ${data.ai_confidence_threshold}; Upload limit: ${data.max_image_upload_size_mb}MB`
    );

    return { ...settings };
  },
};

export default adminService;
