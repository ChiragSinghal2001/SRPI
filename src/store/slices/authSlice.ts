import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole, AuthState } from '../../types/auth';

// Default initial demo user (Landlord)
const defaultDemoUser: User = {
  id: 'usr_landlord_1',
  name: 'John Lock',
  email: 'john.lock@realtycorp.com',
  role: 'LANDLORD',
  company: 'Pacific Heights Property Management',
  phone: '+1 (555) 234-5678',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const defaultDemoTenant: User = {
  id: 'usr_tenant_1',
  name: 'Sarah Miller',
  email: 'sarah.miller@example.com',
  role: 'TENANT',
  phone: '+1 (555) 876-5432',
  assignedPropertyId: 'prop_1',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
};

const initialState: AuthState = {
  user: defaultDemoUser,
  token: 'mock_jwt_token_landlord_xyz_123',
  role: 'LANDLORD',
  isAuthenticated: true,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
      state.error = null;
    },
    switchDemoRole: (state, action: PayloadAction<UserRole>) => {
      const targetRole = action.payload;
      if (targetRole === 'LANDLORD') {
        state.user = defaultDemoUser;
        state.token = 'mock_jwt_token_landlord_xyz_123';
        state.role = 'LANDLORD';
      } else {
        state.user = defaultDemoTenant;
        state.token = 'mock_jwt_token_tenant_abc_789';
        state.role = 'TENANT';
      }
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, switchDemoRole, logout, setAuthLoading, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
