export type UserRole = 'admin' | 'landlord' | 'tenant' | 'ADMIN' | 'LANDLORD' | 'TENANT';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  company?: string;
  assignedPropertyId?: string; // For tenant role
  status?: 'active' | 'suspended';
  last_login?: string;
  created_at?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  company?: string;
}
