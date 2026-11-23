import { RentalApplication, Property } from '../types/property';
import { MOCK_RENTAL_APPLICATIONS } from './mockData';
import { propertyService } from './propertyService';

let applications: RentalApplication[] = [...MOCK_RENTAL_APPLICATIONS];

export const rentalService = {
  async getApplications(): Promise<RentalApplication[]> {
    await new Promise((res) => setTimeout(res, 200));
    return [...applications];
  },

  async getApplicationsForTenant(tenantIdOrEmail: string): Promise<RentalApplication[]> {
    await new Promise((res) => setTimeout(res, 200));
    return applications.filter(
      (a) =>
        a.tenantId === tenantIdOrEmail ||
        a.tenantEmail.toLowerCase() === tenantIdOrEmail.toLowerCase()
    );
  },

  async createApplication(
    data: Omit<RentalApplication, 'id' | 'createdAt' | 'status' | 'reviewedAt'>
  ): Promise<RentalApplication> {
    await new Promise((res) => setTimeout(res, 350));
    const newApp: RentalApplication = {
      ...data,
      id: `app_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    applications = [newApp, ...applications];
    return newApp;
  },

  async approveApplication(
    applicationId: string
  ): Promise<{ application: RentalApplication; property: Property }> {
    await new Promise((res) => setTimeout(res, 350));
    const appIndex = applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = applications[appIndex];
    const reviewedApp: RentalApplication = {
      ...app,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
    };
    applications[appIndex] = reviewedApp;

    // Calculate lease end date: default 12 months from moveInDate
    const moveIn = new Date(app.moveInDate || new Date());
    const leaseEnd = new Date(moveIn);
    leaseEnd.setMonth(leaseEnd.getMonth() + (app.leaseDurationMonths || 12));
    const leaseEndDateStr = leaseEnd.toISOString().split('T')[0];

    // Assign tenant to the property in propertyService
    const updatedProperty = await propertyService.updateProperty(app.propertyId, {
      status: 'occupied',
      monthlyRent: app.monthlyRent,
      securityDeposit: app.depositAmount,
      currentTenant: {
        id: app.tenantId,
        name: app.tenantName,
        email: app.tenantEmail,
        phone: app.tenantPhone,
        leaseStartDate: app.moveInDate,
        leaseEndDate: leaseEndDateStr,
        depositAmount: app.depositAmount,
        monthlyRent: app.monthlyRent,
      },
    });

    return { application: reviewedApp, property: updatedProperty };
  },

  async rejectApplication(applicationId: string): Promise<RentalApplication> {
    await new Promise((res) => setTimeout(res, 250));
    const appIndex = applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = applications[appIndex];
    const rejectedApp: RentalApplication = {
      ...app,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
    };
    applications[appIndex] = rejectedApp;
    return rejectedApp;
  },

  async cancelApplication(applicationId: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    applications = applications.filter((a) => a.id !== applicationId);
  },
};

export default rentalService;
