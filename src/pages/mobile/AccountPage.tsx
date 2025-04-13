
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Settings, LogOut, Bell, Shield, Info } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileMenu from '@/components/mobile/MobileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès',
      });
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Erreur de déconnexion',
        description: 'Une erreur est survenue lors de la déconnexion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader />
      
      <div className="px-4 py-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="p-1" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Mon Compte</h1>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center">
            <div className="bg-[#0D6A51] p-3 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium">{user?.email || 'Utilisateur'}</h3>
              <p className="text-sm text-gray-500">Client</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => navigate('/mobile-flow/account/profile')}>
              Modifier
            </Button>
          </CardContent>
        </Card>
        
        <h2 className="text-lg font-semibold mb-4">Paramètres</h2>
        
        <div className="grid gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-gray-500">Gérer les notifications</p>
              </div>
              <Button variant="ghost" className="ml-auto">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Sécurité</h3>
                <p className="text-sm text-gray-500">Paramètres de sécurité</p>
              </div>
              <Button variant="ghost" className="ml-auto">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Info className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">À propos</h3>
                <p className="text-sm text-gray-500">Informations sur l'application</p>
              </div>
              <Button variant="ghost" className="ml-auto">
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardContent>
          </Card>
          
          <Button 
            variant="destructive" 
            className="mt-6"
            disabled={isLoading}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
          </Button>
        </div>
      </div>
      
      <MobileMenu />
    </div>
  );
};

export default AccountPage;
