
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Home, 
  CreditCard, 
  User, 
  Settings, 
  LogOut,
  Wallet,
  Building
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MobileDrawerMenu: React.FC<MobileDrawerMenuProps> = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const menuItems = [
    { 
      label: 'Accueil', 
      icon: <Home className="h-5 w-5 mr-3" />, 
      path: '/mobile-flow/main',
      divider: false
    },
    { 
      label: 'Prêts', 
      icon: <CreditCard className="h-5 w-5 mr-3" />, 
      path: '/mobile-flow/loans',
      divider: false
    },
    { 
      label: 'Fonds', 
      icon: <Wallet className="h-5 w-5 mr-3" />, 
      path: '/mobile-flow/funds-management',
      divider: false
    },
    { 
      label: 'Sélectionner SFD', 
      icon: <Building className="h-5 w-5 mr-3" />, 
      path: '/mobile-flow/sfd-selector',
      divider: true
    },
    { 
      label: 'Profil', 
      icon: <User className="h-5 w-5 mr-3" />, 
      path: '/mobile-flow/profile',
      divider: false
    },
    { 
      label: 'Paramètres', 
      icon: <Settings className="h-5 w-5 mr-3" />, 
      path: '/settings',
      divider: true
    }
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center border-b">
            <div>
              <h2 className="font-bold">Menu</h2>
              {user && (
                <p className="text-sm text-gray-500">{user.email}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="py-2">
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <div 
                    className="px-4 py-3 flex items-center hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.divider && <div className="mx-4 my-2 border-t" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileDrawerMenu;
