import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Building, 
  Wallet, 
  HandCoins, 
  Bell, 
  MessageSquare, 
  HelpCircle, 
  Settings, 
  Search 
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
          <h2 className="text-xl font-bold">Menu principal</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Opérations bancaires</h3>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/payment')}>
              <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" /> Paiements et transferts
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/secure-payment')}>
              <ShieldCheck className="h-5 w-5 mr-2 text-[#0D6A51]" /> Paiement sécurisé
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/schedule-transfer')}>
              <Calendar className="h-5 w-5 mr-2 text-[#0D6A51]" /> Transferts programmés
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/multi-sfd')}>
              <Building className="h-5 w-5 mr-2 text-[#0D6A51]" /> Gestion Multi-SFD
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/secure-layer')}>
              <ShieldCheck className="h-5 w-5 mr-2 text-[#0D6A51]" /> Sécurité avancée
            </Button>
          </div>
          
          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Prêts et financements</h3>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/funds-management')}>
              <Wallet className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Mes fonds
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/loan-application')}>
              <HandCoins className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Demander un prêt
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/payment-options')}>
              <CreditCard className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Options de paiement
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateAndClose('/mobile-flow/late-payments')}>
              <Bell className="h-5 w-5 mr-2 text-[#FFAB2E]" /> Alertes retards
            </Button>
          </div>

          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Support & Aide</h3>
            <Button variant="ghost" className="justify-start">
              <MessageSquare className="h-5 w-5 mr-2" /> Contacter un conseiller
            </Button>
            <Button variant="ghost" className="justify-start">
              <HelpCircle className="h-5 w-5 mr-2" /> FAQ et assistance
            </Button>
            <Button variant="ghost" className="justify-start">
              <Search className="h-5 w-5 mr-2" /> Rechercher
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
