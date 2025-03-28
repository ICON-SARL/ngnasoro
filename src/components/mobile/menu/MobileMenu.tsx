
import React from 'react';
import { X, LogOut, ShieldCheck, CreditCard, Building, User, Settings, HelpCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/hooks/auth/types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userRole?: UserRole | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  onLogout,
  userRole = 'user'
}) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[85%] sm:max-w-md p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left flex items-center">
              <img 
                src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
                alt="NGNA SÔRÔ! Logo" 
                className="h-8 w-auto mr-2"
              />
              <span className="text-base font-semibold">
                <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
              </span>
            </SheetTitle>
            <SheetClose onClick={onClose}>
              <X className="h-5 w-5 text-gray-500" />
              <span className="sr-only">Fermer</span>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <div className="py-4 px-6">
          {/* User Role Banner */}
          <div className={`mb-4 px-4 py-3 rounded-lg ${
            userRole === 'admin' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
            userRole === 'sfd_admin' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            'bg-green-50 text-green-800 border border-green-200'
          }`}>
            <div className="flex items-center">
              {userRole === 'admin' ? (
                <ShieldCheck className="h-5 w-5 mr-2" />
              ) : userRole === 'sfd_admin' ? (
                <Building className="h-5 w-5 mr-2" />
              ) : (
                <User className="h-5 w-5 mr-2" />
              )}
              <div>
                <p className="font-medium">
                  {userRole === 'admin' ? 'Super Admin' : 
                   userRole === 'sfd_admin' ? 'Admin SFD' : 
                   'Utilisateur'}
                </p>
                <p className="text-xs">
                  {userRole === 'admin' ? 'Accès complet au système' : 
                   userRole === 'sfd_admin' ? 'Gestion des prêts et clients' : 
                   'Accès aux services financiers'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase">Services</h3>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => { navigate('/mobile-flow'); onClose(); }}
                >
                  <User className="mr-2 h-5 w-5" />
                  Mon Dashboard
                </Button>
                
                {hasPermission('view_transactions') && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => { navigate('/mobile-flow/transactions'); onClose(); }}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Mes Transactions
                  </Button>
                )}
                
                {hasPermission('apply_for_loans') && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => { navigate('/mobile-flow/loan-activity'); onClose(); }}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Demandes de Prêt
                  </Button>
                )}
              </div>
            </div>
            
            {/* Admin Section - only visible for admins and sfd_admins */}
            {(userRole === 'admin' || userRole === 'sfd_admin') && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase">Administration</h3>
                <div className="space-y-1">
                  {userRole === 'admin' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => { navigate('/super-admin-dashboard'); onClose(); }}
                    >
                      <ShieldCheck className="mr-2 h-5 w-5 text-amber-600" />
                      Dashboard Admin
                    </Button>
                  )}
                  
                  {userRole === 'sfd_admin' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => { navigate('/agency-dashboard'); onClose(); }}
                    >
                      <Building className="mr-2 h-5 w-5 text-blue-600" />
                      Dashboard SFD
                    </Button>
                  )}
                  
                  {hasPermission('manage_sfd_clients') && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => { navigate('/mobile-flow/sfd-clients'); onClose(); }}
                    >
                      <User className="mr-2 h-5 w-5" />
                      Gestion Clients
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase">Paramètres</h3>
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => { navigate('/mobile-flow/profile'); onClose(); }}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Paramètres
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700"
                  onClick={() => { window.location.href = 'https://docs.ngnasoro.ml/'; onClose(); }}
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Aide et Support
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => { onLogout(); onClose(); }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
