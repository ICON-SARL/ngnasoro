
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, User, CreditCard, FileText, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const MobileProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const handleMenuItemClick = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès."
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { icon: <User size={20} />, label: "Informations personnelles", path: "/mobile-flow/profile" },
    { icon: <CreditCard size={20} />, label: "Mes SFDs", path: "/mobile-flow/sfd-selector" },
    { icon: <FileText size={20} />, label: "KYC & Documents", path: "/mobile-flow/diagnostics" },
    { icon: <Settings size={20} />, label: "Paramètres", path: "/mobile-flow/profile" },
    { icon: <HelpCircle size={20} />, label: "Aide", path: "/mobile-flow/profile" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profil</h1>
      
      <Card className="p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center text-primary-foreground text-xl font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-4">
            <h2 className="font-semibold">{user?.email || 'Utilisateur'}</h2>
            <p className="text-sm text-gray-600">{user?.phone || 'Aucun numéro de téléphone'}</p>
          </div>
        </div>
      </Card>
      
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Card key={index} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleMenuItemClick(item.path)}>
            <div className="flex items-center">
              <div className="text-primary mr-3">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          </Card>
        ))}
      </div>
      
      <Button variant="outline" className="w-full mt-8 text-red-500 border-red-200" onClick={handleSignOut}>
        <LogOut size={16} className="mr-2" /> Se déconnecter
      </Button>
    </div>
  );
};

export default MobileProfilePage;
