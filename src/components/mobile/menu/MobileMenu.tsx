
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mobileMenuSections } from '@/config/mobileNavigation';
import * as Icons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();

  if (!isOpen) return null;

  const navigateAndClose = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      onClose();
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      await signOut();
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Force a redirect
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  // Fonction pour obtenir dynamiquement l'icône de Lucide
  const getIcon = (iconName: string, className: string = "h-5 w-5 mr-2") => {
    const IconComponent = (Icons as any)[iconName] || Icons.CircleDot;
    return <IconComponent className={className} />;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Menu principal</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {getIcon('X')}
          </Button>
        </div>
        
        <div className="space-y-6">
          {mobileMenuSections.map((section) => (
            <div key={section.id} className="flex flex-col space-y-1">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{section.title}</h3>
              {section.items.map((item) => (
                <Button 
                  key={item.id}
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => navigateAndClose(item.route)}
                  disabled={item.coming}
                >
                  {getIcon(item.icon, `h-5 w-5 mr-2 ${item.color ? `text-[${item.color}]` : ""}`)} 
                  <span className="flex-1">{item.label}</span>
                  {item.coming && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Bientôt</span>
                  )}
                </Button>
              ))}
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-200">
            <Button variant="ghost" className="justify-start w-full" onClick={handleLogout}>
              {getIcon('LogOut')} Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
