
import React from 'react';
import { Home, User, ArrowUpDown, Wallet, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MobileMenuProps {
  onLogout?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center h-16 z-50">
      <Link to="/mobile-flow/main" className={`flex flex-col items-center justify-center flex-1 ${isActive('/mobile-flow/main') ? 'text-[#0D6A51]' : 'text-gray-500'}`}>
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Accueil</span>
      </Link>
      
      <Link to="/mobile-flow/loans" className={`flex flex-col items-center justify-center flex-1 ${isActive('/mobile-flow/loans') ? 'text-[#0D6A51]' : 'text-gray-500'}`}>
        <CreditCard className="h-5 w-5" />
        <span className="text-xs mt-1">Prêts</span>
      </Link>
      
      <Link to="/mobile-flow/payment" className={`flex flex-col items-center justify-center flex-1 ${isActive('/mobile-flow/payment') ? 'text-[#0D6A51]' : 'text-gray-500'}`}>
        <Wallet className="h-5 w-5" />
        <span className="text-xs mt-1">Paiement</span>
      </Link>
      
      <Link to="/mobile-flow/account" className={`flex flex-col items-center justify-center flex-1 ${isActive('/mobile-flow/account') ? 'text-[#0D6A51]' : 'text-gray-500'}`}>
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Compte</span>
      </Link>
    </div>
  );
};

export default MobileMenu;
