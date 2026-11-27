import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';

// Layouts
import LandlordLayout from '../layouts/LandlordLayout';
import TenantLayout from '../layouts/TenantLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import RoleGuard from './RoleGuard';
import AdminRoute from './AdminRoute';

// Auth Pages
import LoginPage from '../features/auth/LoginPage';
import SignupPage from '../features/auth/SignupPage';

// Landlord Pages
import DashboardPage from '../features/dashboard/DashboardPage';
import PropertiesPage from '../features/properties/PropertiesPage';
import PropertyDetailPage from '../features/properties/PropertyDetailPage';
import TenantsPage from '../features/tenants/TenantsPage';
import InspectionWizardPage from '../features/wizard/InspectionWizardPage';
import AIReviewPage from '../features/ai-review/AIReviewPage';
import ReportPreviewPage from '../features/reports/ReportPreviewPage';
import DisputesPage from '../features/disputes/DisputesPage';
import MaintenancePage from '../features/maintenance/MaintenancePage';
import AuditLogPage from '../features/audit/AuditLogPage';

// Tenant Pages
import TenantHomePage from '../features/tenant-portal/TenantHomePage';
import TenantReportViewerPage from '../features/tenant-portal/TenantReportViewerPage';
import TenantDisputesPage from '../features/tenant-portal/TenantDisputesPage';
import TenantMaintenancePage from '../features/tenant-portal/TenantMaintenancePage';

// Admin Pages
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import AdminUsersPage from '../features/admin/AdminUsersPage';
import AdminUserDetailPage from '../features/admin/AdminUserDetailPage';
import AdminPropertiesPage from '../features/admin/AdminPropertiesPage';
import AdminReportsPage from '../features/admin/AdminReportsPage';
import AdminAiJobsPage from '../features/admin/AdminAiJobsPage';
import AdminDisputesPage from '../features/admin/AdminDisputesPage';
import AdminAuditLogsPage from '../features/admin/AdminAuditLogsPage';
import AdminSettingsPage from '../features/admin/AdminSettingsPage';
import AdminProfilePage from '../features/admin/AdminProfilePage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = role?.toLowerCase();
  if (normalizedRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (normalizedRole === 'tenant') {
    return <Navigate to="/tenant" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Landlord Protected Portal */}
      <Route
        element={
          <RoleGuard allowedRoles={['LANDLORD']}>
            <LandlordLayout />
          </RoleGuard>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/inspections/new" element={<InspectionWizardPage />} />
        <Route path="/inspections/:id/review" element={<AIReviewPage />} />
        <Route path="/reports/:id" element={<ReportPreviewPage />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/audit-logs" element={<AuditLogPage />} />
      </Route>

      {/* Tenant Protected Portal */}
      <Route
        element={
          <RoleGuard allowedRoles={['TENANT']}>
            <TenantLayout />
          </RoleGuard>
        }
      >
        <Route path="/tenant" element={<TenantHomePage />} />
        <Route path="/tenant/reports/:id" element={<TenantReportViewerPage />} />
        <Route path="/tenant/disputes" element={<TenantDisputesPage />} />
        <Route path="/tenant/maintenance" element={<TenantMaintenancePage />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
        <Route path="/admin/properties" element={<AdminPropertiesPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/ai-jobs" element={<AdminAiJobsPage />} />
        <Route path="/admin/disputes" element={<AdminDisputesPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
