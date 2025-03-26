
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Home, Wallet, User, CreditCard, Settings } from 'lucide-react';
import { useState } from 'react';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const MobileNavigation = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Accueil",
      action: () => setActiveTab('home')
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      label: "Cartes",
      action: () => setActiveTab('cards')
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      label: "Finances",
      action: () => setActiveTab('finances')
    },
    {
      icon: <User className="h-6 w-6" />,
      label: "Profil",
      action: () => setActiveTab('profile')
    }
  ];

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="flex justify-around items-center">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center py-3 px-5 ${
              activeTab === item.label.toLowerCase() 
                ? 'text-[#0D6A51]' 
                : 'text-gray-500'
            }`}
            onClick={item.action}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
