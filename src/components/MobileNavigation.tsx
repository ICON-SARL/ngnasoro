import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, MessageCircle, User } from 'lucide-react';

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
      path: '/mobile-flow/dashboard'
    },
    {
      id: 'accounts',
      label: 'Comptes',
      icon: Building2,
      path: '/mobile-flow/accounts'
    },
    {
      id: 'support',
      label: 'Support',
      icon: MessageCircle,
      path: '/mobile-flow/support'
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
          className={`flex flex-col items-center ${isActive(item.path) ? 'text-[#176455]' : 'text-gray-500'}`}
          onClick={() => handleNavigation(item.path, `Navigate to ${item.label}`)}
        >
          <div className={`p-2 rounded-full ${isActive(item.path) ? 'bg-[#176455]/10' : ''}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default MobileNavigation;
