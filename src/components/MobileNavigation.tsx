
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, PiggyBank, User } from 'lucide-react';

interface MobileNavigationProps {
  onAction?: (action: string, data?: any) => void;
  isHeader?: boolean;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  onAction,
  isHeader = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const handleNavigation = (path: string, action?: string) => {
    navigate(path);
    if (onAction && action) {
      onAction(action);
    }
  };

  return (
    <div className={`${isHeader ? '' : 'fixed bottom-0 left-0 right-0 z-40'} bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center ${className}`}>
      <div 
        className={`flex flex-col items-center ${isActive('/mobile-flow/main') ? 'text-[#0D6A51]' : 'text-gray-500'}`}
        onClick={() => handleNavigation('/mobile-flow/main', 'Navigate to Home')}
      >
        <div className={`p-2 rounded-full ${isActive('/mobile-flow/main') ? 'bg-[#0D6A51]/10' : ''}`}>
          <Home className="h-5 w-5" />
        </div>
        <span className="text-xs mt-1">Accueil</span>
      </div>
      
      <div 
        className={`flex flex-col items-center ${isActive('/mobile-flow/loans') ? 'text-[#0D6A51]' : 'text-gray-500'}`}
        onClick={() => handleNavigation('/mobile-flow/loans', 'Navigate to Loans')}
      >
        <div className={`p-2 rounded-full ${isActive('/mobile-flow/loans') ? 'bg-[#0D6A51]/10' : ''}`}>
          <CreditCard className="h-5 w-5" />
        </div>
        <span className="text-xs mt-1">Prêts</span>
      </div>
      
      <div 
        className={`flex flex-col items-center ${isActive('/mobile-flow/savings') ? 'text-[#0D6A51]' : 'text-gray-500'}`}
        onClick={() => handleNavigation('/mobile-flow/savings', 'Navigate to Savings')}
      >
        <div className={`p-2 rounded-full ${isActive('/mobile-flow/savings') ? 'bg-[#0D6A51]/10' : ''}`}>
          <PiggyBank className="h-5 w-5" />
        </div>
        <span className="text-xs mt-1">Mes fonds</span>
      </div>
      
      <div 
        className={`flex flex-col items-center ${isActive('/mobile-flow/profile') ? 'text-[#0D6A51]' : 'text-gray-500'}`}
        onClick={() => handleNavigation('/mobile-flow/profile', 'Navigate to Profile')}
      >
        <div className={`p-2 rounded-full ${isActive('/mobile-flow/profile') ? 'bg-[#0D6A51]/10' : ''}`}>
          <User className="h-5 w-5" />
        </div>
        <span className="text-xs mt-1">Profil</span>
      </div>
    </div>
  );
};

export default MobileNavigation;
