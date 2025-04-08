import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from './ProfileHeader';
import SfdAccountsSection from './SfdAccountsSection';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PersonalInfoSection from './PersonalInfoSection';
import KycVerificationSection from './KycVerificationSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { sfdData, activeSfdId, switchActiveSfd } = useSfdDataAccess();
  const { toast } = useToast();

  const handleGoBack = () => {
    navigate('/mobile-flow/main');
  };

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (!result.success) {
        console.error('Error during logout:', result.error);
        toast({
          title: "Erreur de déconnexion",
          description: result.error || "Une erreur est survenue lors de la déconnexion",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès",
        });
        window.location.replace('/auth');
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur inattendue est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-white py-2 sticky top-0 z-10 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      <ProfileHeader />

      <Tabs 
        defaultValue="accounts" 
        className="w-full mt-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="px-4">
          <SfdAccountsSection 
            sfdData={sfdData} 
            activeSfdId={activeSfdId} 
            onSwitchSfd={switchActiveSfd} 
          />
        </TabsContent>
        
        <TabsContent value="security" className="px-4">
          <SecuritySection />
          <NotificationsSection />
          <AdvancedSettingsSection onLogout={handleLogout} />
        </TabsContent>
        
        <TabsContent value="profile" className="px-4">
          <PersonalInfoSection user={user as any} />
          <KycVerificationSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
