
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Home, User, Wallet, Menu, X, Landmark, Phone } from 'lucide-react';
import { useState } from 'react';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const MobileNavigation = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Accueil",
      action: () => console.log('Navigate to home')
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      label: "Prêts",
      action: () => console.log('Navigate to loans')
    },
    {
      icon: <Landmark className="h-6 w-6" />,
      label: "Épargne",
      action: () => console.log('Navigate to savings')
    },
    {
      icon: <User className="h-6 w-6" />,
      label: "Compte",
      action: () => console.log('Navigate to account')
    }
  ];

  if (!isMobile) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 dark:bg-black/80 dark:border-gray-800">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#0D6A51] dark:text-gray-300 dark:hover:text-[#FFAB2E]"
              onClick={item.action}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
          <button
            className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#0D6A51] dark:text-gray-300 dark:hover:text-[#FFAB2E]"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-3/4 bg-white dark:bg-gray-900 h-full p-4 animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
                  alt="NGNA SÔRÔ! Logo" 
                  className="h-8 w-auto" 
                />
                <h2 className="text-xl font-bold">
                  <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="space-y-4">
              <a href="#" className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <Wallet className="h-5 w-5 text-[#0D6A51]" />
                <span>Historique des transactions</span>
              </a>
              <a href="#" className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <User className="h-5 w-5 text-[#0D6A51]" />
                <span>Paramètres du compte</span>
              </a>
              <a href="#" className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#0D6A51]" />
                <span>Support client</span>
              </a>
              <a href="#" className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <Landmark className="h-5 w-5 text-[#0D6A51]" />
                <span>À propos de MEREF-SFD</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
