
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Building, 
  Wallet, 
  HandCoins, 
  Bell, 
  CreditCard, 
  Calendar, 
  ShieldCheck,
  HelpCircle, 
  Settings
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
    <div className="absolute top-0 left-0 w-full h-full bg-white z-50">
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
              <Building className="h-5 w-5 mr-2 text-[#0D6A51]" /> Gestion Multi-SFD
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/sfd-clients')}>
              <Building className="h-5 w-5 mr-2 text-[#0D6A51]" /> Clients SFD
            </Button>
          </div>
          
          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Prêts et paiements</h3>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/funds-management')}>
              <Wallet className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Mes fonds
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/loan-application')}>
              <HandCoins className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Demander un prêt
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/secure-payment')}>
              <ShieldCheck className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Paiement sécurisé
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/schedule-transfer')}>
              <Calendar className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Transferts programmés
            </Button>
          </div>

          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Aide et Compte</h3>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/profile')}>
              <Settings className="h-5 w-5 mr-2" /> Mon profil
            </Button>
            <Button variant="ghost" className="justify-start">
              <HelpCircle className="h-5 w-5 mr-2" /> Assistance
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <Button variant="ghost" className="justify-start w-full" onClick={onLogout}>
              <Settings className="h-5 w-5 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
