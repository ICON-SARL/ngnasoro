
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Home, Wallet, User, Plus, Activity } from 'lucide-react';
import { useState } from 'react';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const MobileNavigation = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('home');

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Accueil",
      action: () => setActiveTab('home')
    },
    {
      icon: <Activity className="h-6 w-6" />,
      label: "Activité",
      action: () => setActiveTab('activity')
    },
    {
      icon: null,
      label: "",
      action: () => console.log('Action button')
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      label: "Cartes",
      action: () => setActiveTab('cards')
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
      <div className="flex justify-around items-center px-2 relative">
        {navigationItems.map((item, index) => {
          // Center button (Plus)
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
          
          // Regular nav buttons
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center py-3 px-3 ${
                activeTab === item.label.toLowerCase() 
                  ? 'text-black' 
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
