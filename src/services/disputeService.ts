import { DisputeItem } from '../types/dispute';
import { MOCK_DISPUTES } from './mockData';

let disputes = [...MOCK_DISPUTES];

export const disputeService = {
  async getDisputes(filter?: { propertyId?: string; tenantId?: string; status?: string }): Promise<DisputeItem[]> {
    await new Promise((res) => setTimeout(res, 300));
    let list = [...disputes];
    if (filter?.propertyId) list = list.filter((d) => d.propertyId === filter.propertyId);
    if (filter?.tenantId) list = list.filter((d) => d.tenantId === filter.tenantId);
    if (filter?.status) list = list.filter((d) => d.status === filter.status);
    return list;
  },

  async createDispute(data: Omit<DisputeItem, 'id' | 'createdAt' | 'status'>): Promise<DisputeItem> {
    await new Promise((res) => setTimeout(res, 400));
    const newDispute: DisputeItem = {
      ...data,
      id: `disp_${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    disputes = [newDispute, ...disputes];
    return newDispute;
  },

  async resolveDispute(
    disputeId: string,
    action: 'accept' | 'reject',
    resolutionNote: string
  ): Promise<DisputeItem> {
    await new Promise((res) => setTimeout(res, 350));
    const item = disputes.find((d) => d.id === disputeId);
    if (!item) throw new Error(`Dispute ${disputeId} not found`);

    item.status = action === 'accept' ? 'accepted' : 'rejected';
    item.landlordResolutionNote = resolutionNote;
    item.resolvedAt = new Date().toISOString();
    return { ...item };
  },
};

export default disputeService;
