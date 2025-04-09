
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, ChevronRight, Plus } from 'lucide-react';
import NoSfdAccountCard from './sfd-accounts/NoSfdAccountCard';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-3 px-4">{title}</h2>
    {children}
  </div>
);

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hasSfdAccount, setHasSfdAccount] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Mock API call to check if user has SFD accounts
    const checkSfdAccounts = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // For demo purposes, set to false to show the "Discover SFDs" option
        setHasSfdAccount(false);
      } catch (error) {
        console.error('Error checking SFD accounts:', error);
        setHasSfdAccount(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSfdAccounts();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const handleAddSfd = () => {
    navigate('/mobile-flow/sfd-setup');
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-6 mb-16">
      <div className="mb-8 text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="bg-[#0D6A51]/20 text-[#0D6A51]">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold mb-1">{user?.full_name || 'Utilisateur'}</h1>
        <p className="text-gray-500">{user?.email}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
        </div>
      ) : !hasSfdAccount ? (
        <NoSfdAccountCard />
      ) : (
        <ProfileSection title="Mes comptes SFD">
          <Card>
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center px-4 py-3 h-auto"
                onClick={handleAddSfd}
              >
                <span className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un compte SFD
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </ProfileSection>
      )}

      <ProfileSection title="Paramètres">
        <Card>
          <CardContent className="p-0 divide-y">
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center px-4 py-3 h-auto"
              onClick={() => {/* Navigate to security settings */}}
            >
              <span>Sécurité</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center px-4 py-3 h-auto"
              onClick={() => {/* Navigate to notifications settings */}}
            >
              <span>Notifications</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </ProfileSection>
      
      <Button
        variant="destructive"
        className="w-full mt-6"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Déconnexion
      </Button>
    </div>
  );
};

export default ProfilePage;
