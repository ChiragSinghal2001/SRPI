import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { addToast } from '../store/slices/uiSlice';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const warnedRef = useRef(false);

  const normalizedRole = role?.toLowerCase();
  const isAdmin = isAuthenticated && normalizedRole === 'admin';

  useEffect(() => {
    if (isAuthenticated && !isAdmin && !warnedRef.current) {
      warnedRef.current = true;
      dispatch(
        addToast({
          type: 'warning',
          title: 'Access Denied',
          message: 'Admin oversight privileges required. Redirected to your workspace.',
        })
      );
    }
  }, [isAuthenticated, isAdmin, dispatch]);

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    if (normalizedRole === 'tenant') {
      return <Navigate to="/tenant" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
