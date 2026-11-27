import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole, AuthState } from '../../types/auth';
import { SEEDED_USERS } from '../../services/authService';

const defaultDemoUser = SEEDED_USERS[0]; // Unnati Gupta (Landlord)
const defaultDemoTenant = SEEDED_USERS[1]; // Anushka Raj Jain (Tenant)

export const defaultDemoAdmin: User = {
  id: 'usr_admin_1',
  name: 'System Administrator',
  email: 'admin@srpi.test',
  role: 'admin',
  status: 'active',
  phone: '+1 (555) 999-0000',
  company: 'SRPI System Oversight',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  last_login: '2026-11-26T08:00:00Z',
};

const initialState: AuthState = {
  user: defaultDemoUser,
  token: 'mock_jwt_token_landlord_xyz_123',
  role: 'landlord',
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
    updateActiveUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
    switchUser: (
      state,
      action: PayloadAction<{ user: User; token?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token || `jwt_token_${action.payload.user.id}`;
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
      state.error = null;
    },
    switchDemoRole: (state, action: PayloadAction<UserRole>) => {
      const targetRole = action.payload.toLowerCase();
      if (targetRole === 'admin') {
        state.user = defaultDemoAdmin;
        state.token = 'mock_jwt_token_admin_xyz_999';
        state.role = 'admin';
      } else if (targetRole === 'tenant') {
        state.user = defaultDemoTenant;
        state.token = 'mock_jwt_token_tenant_abc_789';
        state.role = 'tenant';
      } else {
        state.user = defaultDemoUser;
        state.token = 'mock_jwt_token_landlord_xyz_123';
        state.role = 'landlord';
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

export const {
  setCredentials,
  updateActiveUser,
  switchUser,
  switchDemoRole,
  logout,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

export default authSlice.reducer;
