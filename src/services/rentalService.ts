import { RentalApplication, Property } from '../types/property';
import { propertyService } from './propertyService';
import { authService } from './authService';
import { syncLoadJsonData, loadJsonData, saveJsonData } from './jsonStorage';

let applications: RentalApplication[] = syncLoadJsonData<RentalApplication[]>('rental_applications');

loadJsonData<RentalApplication[]>('rental_applications').then((apps) => {
  if (apps && apps.length > 0) {
    applications = apps;
  }
});

export const rentalService = {
  async getApplications(filter?: { landlordId?: string }): Promise<RentalApplication[]> {
    await new Promise((res) => setTimeout(res, 150));
    const all = await loadJsonData<RentalApplication[]>('rental_applications');
    if (all && all.length > 0) {
      applications = all;
    }

    if (filter?.landlordId) {
      const landlordProperties = await propertyService.getProperties({ landlordId: filter.landlordId });
      const propertyIds = new Set(landlordProperties.map((p) => p.id));
      return applications.filter((a) => propertyIds.has(a.propertyId));
    }

    return [...applications];
  },

  async getApplicationsForTenant(tenantIdOrEmail: string): Promise<RentalApplication[]> {
    await new Promise((res) => setTimeout(res, 150));
    const all = await loadJsonData<RentalApplication[]>('rental_applications');
    if (all && all.length > 0) {
      applications = all;
    }
    const query = tenantIdOrEmail.toLowerCase().trim();
    return applications.filter(
      (a) =>
        a.tenantId === tenantIdOrEmail ||
        a.tenantEmail.toLowerCase().trim() === query
    );
  },

  async createApplication(
    data: Omit<RentalApplication, 'id' | 'createdAt' | 'status' | 'reviewedAt'>
  ): Promise<RentalApplication> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await loadJsonData<RentalApplication[]>('rental_applications');
    if (all && all.length > 0) {
      applications = all;
    }

    const newApp: RentalApplication = {
      ...data,
      id: `app_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    applications = [newApp, ...applications];
    // Persist directly to src/data/rental_applications.json on disk!
    await saveJsonData('rental_applications', applications);
    return newApp;
  },

  async approveApplication(
    applicationId: string
  ): Promise<{ application: RentalApplication; property: Property }> {
    await new Promise((res) => setTimeout(res, 300));
    const all = await loadJsonData<RentalApplication[]>('rental_applications');
    if (all && all.length > 0) {
      applications = all;
    }

    const appIndex = applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = applications[appIndex];
    const reviewedApp: RentalApplication = {
      ...app,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
    };
    applications[appIndex] = reviewedApp;
    // Persist directly to src/data/rental_applications.json on disk!
    await saveJsonData('rental_applications', applications);

    // Calculate lease end date: default 12 months from moveInDate
    const moveIn = new Date(app.moveInDate || new Date());
    const leaseEnd = new Date(moveIn);
    leaseEnd.setMonth(leaseEnd.getMonth() + (app.leaseDurationMonths || 12));
    const leaseEndDateStr = leaseEnd.toISOString().split('T')[0];

    const targetProp = (await propertyService.getAllProperties()).find((p) => p.id === app.propertyId);
    const resolvedRent = app.monthlyRent || targetProp?.monthlyRent || 1850;
    const resolvedDeposit = app.depositAmount || targetProp?.securityDeposit || 2000;
    const resolvedStart = app.moveInDate || new Date().toISOString().split('T')[0];

    // Assign tenant to the property in propertyService
    const updatedProperty = await propertyService.updateProperty(app.propertyId, {
      status: 'occupied',
      monthlyRent: resolvedRent,
      securityDeposit: resolvedDeposit,
      currentTenant: {
        id: app.tenantId,
        name: app.tenantName,
        email: app.tenantEmail,
        phone: app.tenantPhone,
        leaseStartDate: resolvedStart,
        leaseEndDate: leaseEndDateStr,
        depositAmount: resolvedDeposit,
        monthlyRent: resolvedRent,
      },
    });

    // Update tenant profile in authService with assignedPropertyId
    try {
      await authService.updateUser(app.tenantId, {
        assignedPropertyId: app.propertyId,
      });
    } catch {
      // User might be a guest or demo user not in registry
    }

    return { application: reviewedApp, property: updatedProperty };
  },

  async rejectApplication(applicationId: string): Promise<RentalApplication> {
    await new Promise((res) => setTimeout(res, 200));
    const all = await loadJsonData<RentalApplication[]>('rental_applications');
    if (all && all.length > 0) {
      applications = all;
    }

    const appIndex = applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = applications[appIndex];
    const rejectedApp: RentalApplication = {
      ...app,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
    };
    applications[appIndex] = rejectedApp;
    // Persist directly to src/data/rental_applications.json on disk!
    await saveJsonData('rental_applications', applications);
    return rejectedApp;
  },

  async cancelApplication(applicationId: string): Promise<void> {
    const all = await loadJsonData<RentalApplication[]>('rental_applications');
    applications = (all || []).filter((a) => a.id !== applicationId);
    // Persist directly to src/data/rental_applications.json on disk!
    await saveJsonData('rental_applications', applications);
  },
};

export default rentalService;
