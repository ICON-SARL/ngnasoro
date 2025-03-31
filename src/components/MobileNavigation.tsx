
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mobileNavItems } from '@/config/mobileNavigation';
import * as Icons from 'lucide-react';

interface MobileNavigationProps {
  onAction?: (action: string, data?: any) => void;
  isHeader?: boolean;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  onAction = () => {}, 
  isHeader = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (route: string, id: string) => {
    navigate(route);
    onAction(id);
  };
  
  // Function to dynamically get icon from Lucide
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.CircleDot;
    return <IconComponent />;
  };

  // If it's in the header, apply different styles
  if (isHeader) {
    return (
      <div className={`bg-white border-t border-gray-200 py-2 px-3 ${className}`}>
        <div className="flex justify-between items-center">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.route;
            
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  isActive ? 'text-[#0D6A51]' : 'text-gray-500'
                }`}
                onClick={() => handleNavigation(item.route, item.id)}
              >
                <div className={`h-6 w-6 ${isActive ? 'text-[#0D6A51]' : 'text-gray-500'}`}>
                  {getIcon(item.icon)}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-3 z-40 ${className}`}>
      <div className="flex justify-between items-center">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.route;
          
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                isActive ? 'text-[#0D6A51]' : 'text-gray-500'
              }`}
              onClick={() => handleNavigation(item.route, item.id)}
            >
              <div className={`h-6 w-6 ${isActive ? 'text-[#0D6A51]' : 'text-gray-500'}`}>
                {getIcon(item.icon)}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
