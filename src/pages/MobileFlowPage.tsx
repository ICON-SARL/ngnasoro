
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import MobileNavigation from '@/components/MobileNavigation';
import PageContent from '@/components/mobile/page-content';
import { useMobilePermissions } from '@/hooks/mobile/useMobilePermissions';
import { useMobileMenuState } from '@/hooks/mobile/useMobileMenuState';

const MobileFlowPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, userRole } = useAuth();
  const { checkPermissions } = useMobilePermissions();
  const { menuOpen, toggleMenu, handleLogout } = useMobileMenuState();
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);
  
  // If loading or user null, show loader
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full h-full">
        <PageContent 
          toggleMenu={toggleMenu}
          subPath={getSubPath(location)}
        />
      </main>
      
      <MobileNavigation 
        showLoanOption={checkPermissions('apply_for_loans')}
        showAdminOption={
          userRole === 'admin' || 
          userRole === 'sfd_admin' || 
          checkPermissions('manage_sfd_clients') || 
          checkPermissions('manage_sfd_loans')
        }
      />
      
      <MobileMenu 
        isOpen={menuOpen} 
        onClose={toggleMenu} 
        onLogout={handleLogout}
        userRole={userRole}
      />
    </div>
  );
};

// Extract the sub-path from /mobile-flow/X
const getSubPath = (location: { pathname: string }) => {
  const path = location.pathname;
  // If exactly /mobile-flow or /mobile-flow/
  if (path === '/mobile-flow' || path === '/mobile-flow/') {
    return 'main';
  }
  
  // Extract the sub-path
  const parts = path.split('/');
  if (parts.length >= 3) {
    return parts[2]; // /mobile-flow/X -> X
  }
  
  return 'main';
};

export default MobileFlowPage;
