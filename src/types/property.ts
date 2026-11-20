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
  status: 'occupied' | 'vacant' | 'under_inspection';
  createdAt: string;
  updatedAt: string;
}
