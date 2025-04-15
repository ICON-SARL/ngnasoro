
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  PiggyBank, 
  HelpCircle, 
  Info
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const MobileDrawerMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
        <SheetHeader className="px-4 py-6 bg-[#0D6A51] text-white">
          <SheetTitle className="text-white text-xl">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="p-4 flex flex-col gap-2">
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => handleNavigation('/mobile-flow/main')}
          >
            <Home className="h-5 w-5 mr-3" />
            Accueil
          </Button>
          
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => handleNavigation('/mobile-flow/profile')}
          >
            <User className="h-5 w-5 mr-3" />
            Mon profil
          </Button>
          
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => handleNavigation('/mobile-flow/loans')}
          >
            <CreditCard className="h-5 w-5 mr-3" />
            Mes prêts
          </Button>
          
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => handleNavigation('/mobile-flow/savings')}
          >
            <PiggyBank className="h-5 w-5 mr-3" />
            Épargne
          </Button>
          
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => handleNavigation('/mobile-flow/settings')}
          >
            <Settings className="h-5 w-5 mr-3" />
            Paramètres
          </Button>
          
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => handleNavigation('/mobile-flow/help')}
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            Aide
          </Button>
          
          <Button 
            variant="ghost" 
            className="justify-start" 
            onClick={() => handleNavigation('/mobile-flow/about')}
          >
            <Info className="h-5 w-5 mr-3" />
            À propos
          </Button>
          
          <hr className="my-2" />
          
          <Button 
            variant="destructive" 
            className="justify-start" 
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileDrawerMenu;
