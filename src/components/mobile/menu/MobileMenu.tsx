
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Building, 
  Wallet, 
  HandCoins, 
  HelpCircle, 
  Settings,
  User,
  Shield
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen = false, onClose = () => {}, onLogout = () => {} }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const navigateAndClose = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Menu</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Gestion SFD</h3>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/main')}>
              <Building className="h-5 w-5 mr-2 text-[#0D6A51]" /> Tableau de bord
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/multi-sfd')}>
              <Building className="h-5 w-5 mr-2 text-[#0D6A51]" /> Tous mes comptes SFD
            </Button>
          </div>
          
          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Prêts et épargnes</h3>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/funds-management')}>
              <Wallet className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Mon épargne
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/loan-application')}>
              <HandCoins className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Demander un prêt
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/secure-payment')}>
              <Shield className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Remboursement
            </Button>
          </div>

          <div className="flex flex-col space-y-1 border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aide et Compte</h3>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/profile')}>
              <User className="h-5 w-5 mr-2 text-[#0D6A51]" /> Mon profil
            </Button>
            <Button variant="ghost" className="justify-start">
              <HelpCircle className="h-5 w-5 mr-2 text-[#0D6A51]" /> Assistance
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-red-600" 
              onClick={onLogout}
            >
              <Settings className="h-5 w-5 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
