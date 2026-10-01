import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }
  if (requireAdmin && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};
