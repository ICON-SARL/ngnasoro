
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard,
  Building
} from 'lucide-react';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import SfdAdhesionSection from '@/components/mobile/account/SfdAdhesionSection';

const AccountPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  
  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Mon compte</h1>
        <p className="text-gray-500 text-sm">Gérer votre profil et vos paramètres</p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Profil utilisateur */}
        <Card>
          <CardContent className="p-4 flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src="/placeholder-avatar.png" alt="Avatar" />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user?.user_metadata?.full_name || 'Utilisateur'}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Section d'adhésion SFD */}
        <SfdAdhesionSection />
        
        {/* Options de compte */}
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full justify-start py-6 rounded-none border-b"
              onClick={() => navigate('/mobile-flow/settings')}
            >
              <Settings className="mr-3 h-5 w-5 text-gray-600" />
              Paramètres
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start py-6 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default AccountPage;
