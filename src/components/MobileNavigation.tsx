import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Wallet, User, Plus, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  action: () => void;
}

interface MobileNavigationProps {
  onAction?: (action: string) => void;
}

const MobileNavigation = ({ onAction }: MobileNavigationProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('home');

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

  const handleNavItemClick = (value: string, action: string) => {
    setActiveTab(value);
    if (onAction) {
      onAction(action);
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Home",
      value: 'home',
      action: () => handleNavItemClick('home', 'Home')
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      label: "Loans",
      value: 'loans',
      action: () => handleNavItemClick('loans', 'Loans')
    },
    {
      icon: null,
      label: "",
      value: 'action',
      action: () => handleNavItemClick('action', 'Loan Activity')
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      label: "Loan",
      value: 'loan',
      action: () => handleNavItemClick('loan', 'Loan Details')
    },
    {
      icon: <User className="h-6 w-6" />,
      label: "Profile",
      value: 'profile',
      action: () => handleNavItemClick('profile', 'Loan Setup')
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
                  onClick={item.action}
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
              onClick={item.action}
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
