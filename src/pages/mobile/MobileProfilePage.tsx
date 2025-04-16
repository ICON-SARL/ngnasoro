
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User } from 'lucide-react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProfileMenu from '@/components/mobile/profile/ProfileMenu';

const MobileProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoBack = () => {
    navigate('/mobile-flow/main');
  };
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la déconnexion.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get user's first letter for avatar fallback
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </Button>
      </div>
      
      <div className="p-4">
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/80 p-5">
            <div className="flex flex-col items-center text-white">
              <Avatar className="h-20 w-20 border-2 border-white">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-white text-[#0D6A51] text-xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold mt-3">{user?.full_name || 'Utilisateur'}</h2>
              <p className="text-white/80 text-sm">{user?.email || ''}</p>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => navigate('/mobile-flow/profile/edit')}
              >
                Modifier le profil
              </Button>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">Client ID</p>
                <p className="font-medium truncate">{user?.id ? user.id.substring(0, 8) : 'N/A'}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">SFD</p>
                <p className="font-medium">Ngnasoro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <ProfileMenu onLogout={handleLogout} />
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileProfilePage;
