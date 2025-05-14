import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, FileText, PiggyBank, User } from 'lucide-react';

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

  const navigationItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      path: '/mobile-flow/main'
    },
    {
      id: 'loans',
      label: 'Prêts',
      icon: CreditCard,
      path: '/mobile-flow/loans'
    },
    {
      id: 'funds',
      label: 'Mes fonds',
      icon: PiggyBank,
      path: '/mobile-flow/funds-management'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      path: '/mobile-flow/profile'
    }
  ];
  
  return (
    <div className={`${isHeader ? '' : 'fixed bottom-0 left-0 right-0 z-40'} bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center ${className}`}>
      {navigationItems.map((item) => (
        <div 
          key={item.id}
          className={`flex flex-col items-center ${isActive(item.path) ? 'text-[#0D6A51]' : 'text-gray-500'}`}
          onClick={() => handleNavigation(item.path, `Navigate to ${item.label}`)}
        >
          <div className={`p-2 rounded-full ${isActive(item.path) ? 'bg-[#0D6A51]/10' : ''}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default MobileNavigation;
