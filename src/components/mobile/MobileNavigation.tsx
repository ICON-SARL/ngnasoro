
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { mobileNavItems } from '@/config/mobileNavigation';

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

  // Fonction pour obtenir dynamiquement l'icône de Lucide
  const getIcon = (iconName: string, className: string = "h-5 w-5") => {
    const IconComponent = (Icons as any)[iconName] || Icons.CircleDot;
    return <IconComponent className={className} />;
  };
  
  return (
    <div className={`${isHeader ? '' : 'fixed bottom-0 left-0 right-0 z-40'} bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center ${className}`}>
      {mobileNavItems.map((item) => (
        <div 
          key={item.id}
          className={`flex flex-col items-center ${isActive(item.route) ? 'text-[#0D6A51]' : 'text-gray-500'}`}
          onClick={() => handleNavigation(item.route, `Navigate to ${item.label}`)}
        >
          <div className={`p-2 rounded-full ${isActive(item.route) ? 'bg-[#0D6A51]/10' : ''}`}>
            {getIcon(item.icon, "h-5 w-5")}
          </div>
          <span className="text-xs mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default MobileNavigation;
