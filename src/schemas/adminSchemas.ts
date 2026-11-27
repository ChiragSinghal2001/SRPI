/**
 * Zod Schemas mirroring FastAPI Pydantic Models for SRPI Admin
 * All field names follow Python/Pydantic snake_case conventions.
 * Primary IDs are represented as strings.
 */
import { z } from 'zod';

// Mirror of Pydantic model: AdminUserBase / AdminUserResponse
export const AdminUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'landlord', 'tenant']),
  status: z.enum(['active', 'suspended']),
  phone: z.string().optional(),
  company: z.string().optional(),
  properties_count: z.number().int().default(0),
  suspension_reason: z.string().optional(),
  last_login: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

// Mirror of Pydantic model: AdminUserCreateRequest
export const AdminUserCreateSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['landlord', 'tenant']),
  temporary_password: z.string().min(6, 'Temporary password must be at least 6 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export type AdminUserCreateInput = z.infer<typeof AdminUserCreateSchema>;

// Mirror of Pydantic model: PropertyAdminResponse
export const PropertyAdminSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  unit: z.string().optional(),
  landlord_id: z.string(),
  landlord_name: z.string(),
  landlord_email: z.string(),
  tenant_id: z.string().optional(),
  tenant_name: z.string().optional(),
  tenant_email: z.string().optional(),
  monthly_rent: z.number().default(0),
  security_deposit: z.number().default(0),
  inspections_count: z.number().int().default(0),
  last_inspection_date: z.string().optional(),
  genuineness_status: z.enum(['verified', 'pending_check', 'flagged_discrepancy']),
  verified_deed_hash: z.string().optional(),
  status: z.enum(['occupied', 'vacant', 'under_inspection']),
  created_at: z.string(),
});

export type PropertyAdmin = z.infer<typeof PropertyAdminSchema>;

// Mirror of Pydantic model: InspectionReportAdminResponse
export const InspectionReportAdminSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  property_id: z.string(),
  property_name: z.string(),
  property_unit: z.string().optional(),
  type: z.enum(['move_in', 'move_out']),
  status: z.enum(['draft', 'in_review', 'finalised']),
  is_locked: z.boolean().default(true),
  finalised_date: z.string(),
  report_hash: z.string(),
  expected_hash: z.string(),
  integrity_status: z.enum(['verified', 'tampered_mismatch']),
  inspector_name: z.string(),
  findings_count: z.number().int().default(0),
  deductions_total: z.number().default(0),
  created_at: z.string(),
});

export type InspectionReportAdmin = z.infer<typeof InspectionReportAdminSchema>;

// Mirror of Pydantic model: AiJobAdminResponse
export const AiJobAdminSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  property_name: z.string(),
  property_unit: z.string().optional(),
  model_version: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  progress: z.number().int().min(0).max(100),
  started_at: z.string(),
  completed_at: z.string().optional(),
  duration_seconds: z.number().optional(),
  error_message: z.string().optional(),
  average_confidence: z.number().optional(),
  low_confidence_count: z.number().int().default(0),
  findings: z
    .array(
      z.object({
        object: z.string(),
        room: z.string(),
        status: z.enum(['good', 'flagged', 'damaged']),
        severity: z.enum(['none', 'minor', 'moderate', 'major']).optional(),
        confidence: z.number(),
        description: z.string(),
      })
    )
    .default([]),
});

export type AiJobAdmin = z.infer<typeof AiJobAdminSchema>;

// Mirror of Pydantic model: DisputeAdminResponse
export const DisputeAdminSchema = z.object({
  id: z.string(),
  report_id: z.string(),
  property_name: z.string(),
  room: z.string(),
  object: z.string(),
  assessed_amount: z.number(),
  tenant_name: z.string(),
  tenant_comment: z.string(),
  tenant_photo_url: z.string().optional(),
  landlord_name: z.string(),
  landlord_decision: z.string().optional(),
  status: z.enum(['open', 'accepted', 'rejected']),
  is_escalated: z.boolean().default(false),
  internal_notes: z
    .array(
      z.object({
        id: z.string(),
        author: z.string(),
        note: z.string(),
        created_at: z.string(),
      })
    )
    .default([]),
  created_at: z.string(),
  age_days: z.number().int(),
});

export type DisputeAdmin = z.infer<typeof DisputeAdminSchema>;

// Mirror of Pydantic model: AuditLogAdminResponse
export const AuditLogAdminSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
  role: z.enum(['admin', 'landlord', 'tenant', 'system']),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string(),
  ip_address: z.string(),
  details: z.string().optional(),
  created_at: z.string(),
});

export type AuditLogAdmin = z.infer<typeof AuditLogAdminSchema>;

// Mirror of Pydantic model: SystemSettingsAdminResponse
export const SystemSettingsSchema = z.object({
  ai_confidence_threshold: z.number().min(0.5).max(0.99),
  max_image_upload_size_mb: z.number().min(1).max(50),
  allowed_image_types: z.array(z.string()).min(1),
  report_retention_months: z.number().min(1).max(120),
  photo_link_expiry_minutes: z.number().min(5).max(1440),
  maintenance_auto_create: z.boolean(),
});

export type SystemSettings = z.infer<typeof SystemSettingsSchema>;

// Mirror of Pydantic model: AdminStatsResponse
export const AdminStatsSchema = z.object({
  total_users: z.number().int(),
  landlords_count: z.number().int(),
  tenants_count: z.number().int(),
  admins_count: z.number().int(),
  properties_count: z.number().int(),
  inspections_count: z.number().int(),
  finalised_reports_count: z.number().int(),
  open_disputes_count: z.number().int(),
  open_maintenance_count: z.number().int(),
  ai_jobs_queued: z.number().int(),
  ai_jobs_running: z.number().int(),
  ai_jobs_failed: z.number().int(),
  ai_average_confidence: z.number(),
  low_confidence_rate: z.number(),
  failure_rate_7d: z.number(),
  monthly_inspections: z.array(
    z.object({
      month: z.string(),
      count: z.number().int(),
    })
  ),
  findings_by_status: z.object({
    good: z.number().int(),
    flagged: z.number().int(),
    damaged: z.number().int(),
  }),
  ai_jobs_by_status: z.object({
    completed: z.number().int(),
    running: z.number().int(),
    queued: z.number().int(),
    failed: z.number().int(),
  }),
});

export type AdminStats = z.infer<typeof AdminStatsSchema>;
