
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
  const { sfdData, activeSfdId, setActiveSfdId, switchActiveSfd } = useSfdDataAccess();
  const { toast } = useToast();

  const handleGoBack = () => {
    navigate('/mobile-flow/main');
  };

  // Create a wrapper for signOut that properly handles errors and success
  const handleLogout = async () => {
    try {
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      await signOut();
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Force a full page reload and redirect
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
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
