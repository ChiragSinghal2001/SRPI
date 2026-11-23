export interface TenantInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  leaseStartDate: string;
  leaseEndDate: string;
  depositAmount: number;
  monthlyRent: number;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  unit?: string;
  imageUrl?: string;
  rooms: string[];
  currentTenant?: TenantInfo;
  monthlyRent?: number;
  securityDeposit?: number;
  availableDate?: string;
  description?: string;
  status: 'occupied' | 'vacant' | 'under_inspection';
  createdAt: string;
  updatedAt: string;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyUnit?: string;
  propertyAddress: string;
  propertyCity: string;
  monthlyRent: number;
  depositAmount: number;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: string;
  leaseDurationMonths: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

