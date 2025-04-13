
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  const navItems = [
    {
      icon: Home,
      label: 'Accueil',
      path: '/mobile-flow/main',
      isActive: location.pathname === '/mobile-flow/main'
    },
    {
      icon: Wallet,
      label: 'Mes fonds',
      path: '/mobile-flow/savings',
      isActive: location.pathname === '/mobile-flow/savings'
    },
    {
      icon: CreditCard,
      label: 'Mes prêts',
      path: '/mobile-flow/my-loans',
      isActive: location.pathname === '/mobile-flow/my-loans'
    },
    {
      icon: User,
      label: 'Profil',
      path: '/mobile-flow/profile',
      isActive: location.pathname.includes('/mobile-flow/profile')
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item, i) => (
          <button
            key={i}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors",
              item.isActive 
                ? "text-[#0D6A51]" 
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
