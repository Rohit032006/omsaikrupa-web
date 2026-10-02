import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginModal, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      openLoginModal();
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, openLoginModal, navigate]);

  return null;
};

export default LoginPage;
