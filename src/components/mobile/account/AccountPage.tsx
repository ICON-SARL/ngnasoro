import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Bell, Shield, Info, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MobileMenu from '@/components/mobile/MobileMenu';
import ClientCodeDisplay from './ClientCodeDisplay';
import LogoutButton from '@/components/LogoutButton';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="p-1" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Mon Compte</h1>
          <Button variant="ghost" className="ml-auto" onClick={handleMenuToggle}>
            <User className="h-5 w-5" />
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center">
            <Avatar className="h-16 w-16 bg-[#0D6A51]">
              <AvatarFallback className="text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'Utilisateur'} />
            </Avatar>
            <div className="ml-4 flex-1">
              <h3 className="font-medium text-lg">{user?.email || 'client@test.com'}</h3>
              <p className="text-gray-500">Client</p>
            </div>
            <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => navigate('/mobile-flow/account/profile')}>
              Modifier
            </Button>
          </CardContent>
        </Card>
        
        <ClientCodeDisplay />
        
        <h2 className="text-xl font-semibold mb-4 mt-6">Paramètres</h2>
        
        <div className="space-y-4">
          <Card className="border cursor-pointer" onClick={() => navigate('/mobile-flow/account/notifications')}>
            <CardContent className="p-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-gray-500">Gérer les notifications</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
          
          <Card className="border cursor-pointer" onClick={() => navigate('/mobile-flow/account/security')}>
            <CardContent className="p-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">Sécurité</h3>
                <p className="text-sm text-gray-500">Paramètres de sécurité</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
          
          <Card className="border cursor-pointer" onClick={() => navigate('/mobile-flow/account/about')}>
            <CardContent className="p-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Info className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">À propos</h3>
                <p className="text-sm text-gray-500">Informations sur l'application</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
          
          <LogoutButton 
            variant="destructive" 
            className="w-full mt-6"
            text="Se déconnecter"
            redirectPath="/auth"
          />
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default AccountPage;
