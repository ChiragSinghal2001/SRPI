import { MaintenanceTicket, MaintenanceStatus } from '../types/maintenance';
import { MOCK_MAINTENANCE } from './mockData';

let tickets = [...MOCK_MAINTENANCE];

export const maintenanceService = {
  async getTickets(filter?: { propertyId?: string; status?: MaintenanceStatus }): Promise<MaintenanceTicket[]> {
    await new Promise((res) => setTimeout(res, 300));
    let list = [...tickets];
    if (filter?.propertyId) list = list.filter((t) => t.propertyId === filter.propertyId);
    if (filter?.status) list = list.filter((t) => t.status === filter.status);
    return list;
  },

  async updateTicketStatus(id: string, status: MaintenanceStatus): Promise<MaintenanceTicket> {
    await new Promise((res) => setTimeout(res, 250));
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) throw new Error(`Ticket ${id} not found`);
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    return { ...ticket };
  },

  async createTicket(data: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTicket> {
    await new Promise((res) => setTimeout(res, 350));
    const newTicket: MaintenanceTicket = {
      ...data,
      id: `maint_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets = [newTicket, ...tickets];
    return newTicket;
  },
};

export default maintenanceService;
