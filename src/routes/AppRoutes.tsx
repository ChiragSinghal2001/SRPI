import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';

// Layouts
import LandlordLayout from '../layouts/LandlordLayout';
import TenantLayout from '../layouts/TenantLayout';
import AuthLayout from '../layouts/AuthLayout';
import RoleGuard from './RoleGuard';

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

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'TENANT') {
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

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
