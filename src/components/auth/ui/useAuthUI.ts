
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '@/hooks/auth/types';

export const useAuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin' | 'sfd_admin'>('default');
  const [authSuccess, setAuthSuccess] = useState(false);
  
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle hash in URL for OAuth flows
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/mobile-flow');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  // Redirect based on authentication state
  useEffect(() => {
    // Only redirect if not loading and user is authenticated
    if (user && !loading) {
      console.log('Authenticated user:', user);
      console.log('User role:', userRole);
      
      // Ensure we're not already on an auth page to prevent redirect loops
      const isOnAuthPage = ['/auth', '/admin/auth', '/sfd/auth'].some(path => 
        location.pathname.includes(path)
      );
      
      // Don't redirect when we're already on an auth page
      if (!isOnAuthPage) {
        // Redirection based on user's role
        if (userRole === Role.SUPER_ADMIN || user.app_metadata?.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userRole === Role.SFD_ADMIN || user.app_metadata?.role === 'sfd_admin') {
          navigate('/agency-dashboard');
        } else {
          navigate('/mobile-flow');
        }
      }
    }
  }, [user, userRole, loading, navigate, location.pathname]);

  // Update tab based on current route
  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
    
    // Detect admin mode from URL
    if (location.pathname.includes('admin/auth') || location.search.includes('admin=true')) {
      setAuthMode('admin');
    } else if (location.pathname.includes('sfd/auth') || location.search.includes('sfd_admin=true')) {
      setAuthMode('sfd_admin');
    } else {
      setAuthMode('default');
    }
  }, [location.pathname, location.search]);

  return {
    activeTab,
    setActiveTab,
    authMode,
    authSuccess,
    loading,
    user
  };
};
