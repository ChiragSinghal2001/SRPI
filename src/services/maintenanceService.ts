import { MaintenanceTicket, MaintenanceStatus } from '../types/maintenance';
import { syncLoadJsonData, loadJsonData, saveJsonData } from './jsonStorage';

let tickets: MaintenanceTicket[] = syncLoadJsonData<MaintenanceTicket[]>('maintenance');

loadJsonData<MaintenanceTicket[]>('maintenance').then((items) => {
  if (items && items.length > 0) {
    tickets = items;
  }
});

export const maintenanceService = {
  async getTickets(filter?: {
    propertyId?: string;
    status?: MaintenanceStatus;
    propertyIds?: string[];
  }): Promise<MaintenanceTicket[]> {
    await new Promise((res) => setTimeout(res, 150));
    const all = await loadJsonData<MaintenanceTicket[]>('maintenance');
    if (all && all.length > 0) {
      tickets = all;
    }

    let list = [...tickets];
    if (filter?.propertyId) list = list.filter((t) => t.propertyId === filter.propertyId);
    if (filter?.status) list = list.filter((t) => t.status === filter.status);
    if (filter?.propertyIds && filter.propertyIds.length > 0) {
      const pSet = new Set(filter.propertyIds);
      list = list.filter((t) => pSet.has(t.propertyId));
    }
    return list;
  },

  async updateTicketStatus(id: string, status: MaintenanceStatus): Promise<MaintenanceTicket> {
    await new Promise((res) => setTimeout(res, 200));
    const all = await loadJsonData<MaintenanceTicket[]>('maintenance');
    if (all && all.length > 0) {
      tickets = all;
    }

    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) throw new Error(`Ticket ${id} not found`);
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    // Persist directly to src/data/maintenance.json on disk!
    await saveJsonData('maintenance', tickets);
    return { ...ticket };
  },

  async createTicket(data: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTicket> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await loadJsonData<MaintenanceTicket[]>('maintenance');
    if (all && all.length > 0) {
      tickets = all;
    }

    const newTicket: MaintenanceTicket = {
      ...data,
      id: `maint_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets = [newTicket, ...tickets];
    // Persist directly to src/data/maintenance.json on disk!
    await saveJsonData('maintenance', tickets);
    return newTicket;
  },
};

export default maintenanceService;
