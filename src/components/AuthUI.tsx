
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './auth/Logo';
import LanguageSelector from './LanguageSelector';
import { useRoleRedirect } from '@/hooks/auth/useRoleRedirect';
import AuthSuccess from './auth/AuthSuccess';
import AuthHeader from './auth/AuthHeader';
import AuthTabs from './auth/AuthTabs';
import AuthLinks from './auth/AuthLinks';
import TestUserButton from './auth/TestUserButton';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin' | 'sfd'>('default');
  const { user, session, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useRoleRedirect();
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/super-admin-dashboard');
        } else if (userRole === 'sfd_admin') {
          navigate('/agency-dashboard');
        } else {
          navigate('/mobile-flow');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate, userRole]);
  
  useEffect(() => {
    if (user && session) {
      if (userRole === 'admin') {
        navigate('/super-admin-dashboard');
      } else if (userRole === 'sfd_admin') {
        navigate('/agency-dashboard');
      } else {
        navigate('/mobile-flow');
      }
    }
  }, [user, session, navigate, userRole]);

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
    
    if (location.search.includes('admin=true')) {
      setAuthMode('admin');
    } else if (location.search.includes('sfd=true')) {
      setAuthMode('sfd');
    } else {
      setAuthMode('default');
    }
  }, [location.pathname, location.search]);

  if (authSuccess) {
    return <AuthSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <AuthHeader authMode={authMode} />
          <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} authMode={authMode} />
          <AuthLinks authMode={authMode} />
          <TestUserButton />
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
