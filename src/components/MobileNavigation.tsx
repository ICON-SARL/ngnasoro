
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Wallet, User, Plus, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  path: string;
}

interface MobileNavigationProps {
  onAction?: (action: string) => void;
}

const MobileNavigation = ({ onAction }: MobileNavigationProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current path from location
  const currentPath = location.pathname.split('/').pop() || '';
  const [activeTab, setActiveTab] = useState(currentPath || 'main');

  useEffect(() => {
    const pathSegment = location.pathname.split('/').pop() || '';
    setActiveTab(pathSegment || 'main');
  }, [location.pathname]);

  useEffect(() => {
    const handleCustomAction = (event: any) => {
      if (event.detail && event.detail.action && onAction) {
        onAction(event.detail.action);
      }
    };

    window.addEventListener('lovable:action', handleCustomAction);
    
    return () => {
      window.removeEventListener('lovable:action', handleCustomAction);
    };
  }, [onAction]);

  const handleNavItemClick = (value: string, path: string, action: string) => {
    setActiveTab(value);
    navigate(path);
    if (onAction) {
      onAction(action);
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Accueil",
      value: 'main',
      path: '/mobile-flow/main'
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      label: "Prêts",
      value: 'home-loan',
      path: '/mobile-flow/home-loan'
    },
    {
      icon: null,
      label: "",
      value: 'action',
      path: '/mobile-flow/loan-activity'
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      label: "Paiement",
      value: 'payment',
      path: '/mobile-flow/payment'
    },
    {
      icon: <User className="h-6 w-6" />,
      label: "Profil",
      value: 'profile',
      path: '/mobile-flow/loan-setup'
    }
  ];

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="flex justify-around items-center px-2 relative">
        {navigationItems.map((item, index) => {
          if (index === 2) {
            return (
              <div key={index} className="relative -top-5">
                <button 
                  className="bg-black text-white p-4 rounded-full shadow-lg"
                  onClick={() => navigate('/mobile-flow/loan-application')}
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            );
          }
          
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center py-3 px-3 ${
                activeTab === item.value 
                  ? 'text-black font-medium' 
                  : 'text-gray-400'
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
