
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, User, PiggyBank, AlertCircle } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  const navItems = [
    { icon: <Home size={20} />, label: 'Accueil', path: '/mobile-flow/dashboard' },
    { icon: <CreditCard size={20} />, label: 'Prêts', path: '/mobile-flow/loans' },
    { icon: <PiggyBank size={20} />, label: 'Mes Fonds', path: '/mobile-flow/funds-management' },
    { icon: <AlertCircle size={20} />, label: 'Diagnostic', path: '/mobile-flow/diagnostics' },
    { icon: <User size={20} />, label: 'Profil', path: '/mobile-flow/profile' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`flex flex-col items-center justify-center space-y-1 ${
              isActive(item.path) ? 'text-[#0D6A51]' : 'text-gray-500'
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
