import { DisputeItem } from '../types/dispute';
import { syncLoadJsonData, loadJsonData, saveJsonData } from './jsonStorage';

let disputes: DisputeItem[] = syncLoadJsonData<DisputeItem[]>('disputes');

loadJsonData<DisputeItem[]>('disputes').then((items) => {
  if (items && items.length > 0) {
    disputes = items;
  }
});

export const disputeService = {
  async getDisputes(filter?: {
    propertyId?: string;
    tenantId?: string;
    status?: string;
    propertyIds?: string[];
  }): Promise<DisputeItem[]> {
    await new Promise((res) => setTimeout(res, 150));
    const all = await loadJsonData<DisputeItem[]>('disputes');
    if (all && all.length > 0) {
      disputes = all;
    }

    let list = [...disputes];
    if (filter?.propertyId) list = list.filter((d) => d.propertyId === filter.propertyId);
    if (filter?.tenantId) list = list.filter((d) => d.tenantId === filter.tenantId);
    if (filter?.status) list = list.filter((d) => d.status === filter.status);
    if (filter?.propertyIds && filter.propertyIds.length > 0) {
      const pSet = new Set(filter.propertyIds);
      list = list.filter((d) => pSet.has(d.propertyId));
    }
    return list;
  },

  async createDispute(data: Omit<DisputeItem, 'id' | 'createdAt' | 'status'>): Promise<DisputeItem> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await loadJsonData<DisputeItem[]>('disputes');
    if (all && all.length > 0) {
      disputes = all;
    }

    const newDispute: DisputeItem = {
      ...data,
      id: `disp_${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    disputes = [newDispute, ...disputes];
    // Persist directly to src/data/disputes.json on disk!
    await saveJsonData('disputes', disputes);
    return newDispute;
  },

  async resolveDispute(
    disputeId: string,
    action: 'accept' | 'reject',
    resolutionNote: string
  ): Promise<DisputeItem> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await loadJsonData<DisputeItem[]>('disputes');
    if (all && all.length > 0) {
      disputes = all;
    }

    const item = disputes.find((d) => d.id === disputeId);
    if (!item) throw new Error(`Dispute ${disputeId} not found`);

    item.status = action === 'accept' ? 'accepted' : 'rejected';
    item.landlordResolutionNote = resolutionNote;
    item.resolvedAt = new Date().toISOString();
    // Persist directly to src/data/disputes.json on disk!
    await saveJsonData('disputes', disputes);
    return { ...item };
  },
};

export default disputeService;
