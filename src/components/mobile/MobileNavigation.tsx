
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, HelpCircle, CreditCard, Menu } from 'lucide-react';
import MobileDrawerMenu from '@/components/mobile/menu/MobileDrawerMenu';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  const navItems = [
    { icon: <Home size={22} />, label: 'Accueil', path: '/mobile-flow/dashboard' },
    { icon: <CreditCard size={22} />, label: 'Prêts', path: '/mobile-flow/loans' },
    { icon: <HelpCircle size={22} />, label: 'Support', path: '/mobile-flow/support' },
    { icon: <User size={22} />, label: 'Profil', path: '/mobile-flow/profile' },
  ];
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border shadow-lg z-10">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive(item.path) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
          <button
            className="flex flex-col items-center justify-center space-y-1 transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={22} />
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </div>
      
      <MobileDrawerMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default MobileNavigation;
