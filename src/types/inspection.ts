export type InspectionType = 'move_in' | 'move_out';
export type InspectionStatus =
  | 'draft'
  | 'in_progress'
  | 'ai_processing'
  | 'ai_reviewed'
  | 'finalized'
  | 'disputed';

export type ObjectType = 'wall' | 'door' | 'window' | 'floor';
export type ConditionStatus = 'good' | 'flagged' | 'damaged' | 'pending';
export type DamageSeverity = 'minor' | 'moderate' | 'major';

export interface CapturedImageItem {
  id: string;
  roomName: string;
  objectType: ObjectType;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  timestamp: string;
  uploadProgress: number; // 0 to 100
}

/**
 * AI Result specification per project requirements:
 * { "object": "wall", "room": "Living Room", "status": "flagged",
 *   "severity": "minor", "confidence": 0.84,
 *   "description": "Scuff marks near the corner" }
 */
export interface AIFindingRaw {
  object: ObjectType | string;
  room: string;
  status: 'good' | 'flagged' | 'damaged';
  severity?: DamageSeverity;
  confidence: number;
  description: string;
}

export interface LandlordReviewOverride {
  status: ConditionStatus;
  severity?: DamageSeverity;
  notes: string;
  estimatedCost?: number;
  isEdited: boolean;
  editedAt?: string;
}

export interface InspectionFinding {
  id: string;
  room: string;
  object: ObjectType;
  beforeImageUrl?: string;
  afterImageUrl: string;
  aiFinding: AIFindingRaw;
  landlordReview: LandlordReviewOverride;
}

export interface SignatureBlockData {
  signedBy: string;
  role: 'LANDLORD' | 'TENANT';
  signatureDataUrl?: string;
  signedAt: string;
  ipAddress?: string;
}

export interface InspectionSession {
  id: string;
  propertyId: string;
  propertyName: string;
  unit?: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledDate: string;
  inspectorName: string;
  tenantId?: string;
  tenantName?: string;
  tenantEmail?: string;
  capturedImages: Record<string, CapturedImageItem>; // key: `${roomName}_${objectType}`
  findings: InspectionFinding[];
  aiJobId?: string;
  aiJobStatus?: 'queued' | 'processing' | 'completed' | 'failed';
  aiJobProgress?: number; // 0-100
  aiJobError?: string;
  reportHash?: string;
  isLocked: boolean;
  landlordSignature?: SignatureBlockData;
  tenantSignature?: SignatureBlockData;
  createdAt: string;
  updatedAt: string;
}
