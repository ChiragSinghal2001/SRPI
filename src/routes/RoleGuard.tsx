import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { UserRole } from '../types/auth';

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const location = useLocation();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their appropriate role home
    if (role === 'TENANT') {
      return <Navigate to="/tenant" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
