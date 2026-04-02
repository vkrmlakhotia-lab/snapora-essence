import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(isAuthenticated ? '/home' : '/onboarding', { replace: true });
  }, [isAuthenticated, navigate]);

  return null;
};

export default Index;
