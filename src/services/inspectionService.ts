import { InspectionSession, InspectionFinding, LandlordReviewOverride } from '../types/inspection';
import { MOCK_INSPECTIONS } from './mockData';
import { generateReportHash } from '../utils/hash';

let inspections = [...MOCK_INSPECTIONS];

export const inspectionService = {
  async getInspections(filter?: { propertyId?: string; status?: string; tenantId?: string }): Promise<InspectionSession[]> {
    await new Promise((res) => setTimeout(res, 350));
    let list = [...inspections];
    if (filter?.propertyId) list = list.filter((i) => i.propertyId === filter.propertyId);
    if (filter?.status) list = list.filter((i) => i.status === filter.status);
    if (filter?.tenantId) list = list.filter((i) => i.tenantId === filter.tenantId);
    return list;
  },

  async getInspectionById(id: string): Promise<InspectionSession> {
    await new Promise((res) => setTimeout(res, 300));
    const item = inspections.find((i) => i.id === id);
    if (!item) throw new Error(`Inspection session ${id} not found`);
    return JSON.parse(JSON.stringify(item));
  },

  async createInspection(data: Partial<InspectionSession>): Promise<InspectionSession> {
    await new Promise((res) => setTimeout(res, 500));
    const newSession: InspectionSession = {
      id: `insp_${Date.now()}`,
      propertyId: data.propertyId || 'prop_1',
      propertyName: data.propertyName || 'Pinecrest Apartments - Unit 4B',
      unit: data.unit || '4B',
      type: data.type || 'move_out',
      status: 'draft',
      scheduledDate: new Date().toISOString().split('T')[0],
      inspectorName: data.inspectorName || 'John Lock',
      tenantId: data.tenantId || 'usr_tenant_1',
      tenantName: data.tenantName || 'Sarah Miller',
      tenantEmail: data.tenantEmail || 'sarah.miller@example.com',
      capturedImages: data.capturedImages || {},
      findings: data.findings || [],
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    inspections = [newSession, ...inspections];
    return newSession;
  },

  async updateFindingReview(
    inspectionId: string,
    findingId: string,
    override: Partial<LandlordReviewOverride>
  ): Promise<InspectionFinding> {
    await new Promise((res) => setTimeout(res, 300));
    const inspection = inspections.find((i) => i.id === inspectionId);
    if (!inspection) throw new Error(`Inspection ${inspectionId} not found`);

    const finding = inspection.findings.find((f) => f.id === findingId);
    if (!finding) throw new Error(`Finding ${findingId} not found`);

    finding.landlordReview = {
      ...finding.landlordReview,
      ...override,
      isEdited: true,
      editedAt: new Date().toISOString(),
    };
    inspection.updatedAt = new Date().toISOString();
    return finding;
  },

  async lockAndFinalizeReport(
    inspectionId: string,
    landlordName: string,
    signatureDataUrl?: string
  ): Promise<InspectionSession> {
    await new Promise((res) => setTimeout(res, 600));
    const inspection = inspections.find((i) => i.id === inspectionId);
    if (!inspection) throw new Error(`Inspection ${inspectionId} not found`);

    const hash = await generateReportHash({
      id: inspection.id,
      propertyId: inspection.propertyId,
      findings: inspection.findings,
      timestamp: new Date().toISOString(),
      signedBy: landlordName,
    });

    inspection.isLocked = true;
    inspection.status = 'finalized';
    inspection.reportHash = hash;
    inspection.landlordSignature = {
      signedBy: landlordName,
      role: 'LANDLORD',
      signatureDataUrl,
      signedAt: new Date().toISOString(),
    };
    inspection.updatedAt = new Date().toISOString();

    return { ...inspection };
  },
};

export default inspectionService;
