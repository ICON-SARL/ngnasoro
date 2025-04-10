
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, Bell, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from './ProfileHeader';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PersonalInfoSection from './PersonalInfoSection';
import KycVerificationSection from './KycVerificationSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { activeSfdId } = useSfdDataAccess ? useSfdDataAccess() : { activeSfdId: null };

  const handleGoBack = () => {
    navigate('/mobile-flow/main');
  };
  
  const handleNavigateToSfdAccounts = () => {
    navigate('/mobile-flow/profile/sfd-accounts');
  };

  return (
    <div className="pb-20 font-montserrat">
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
          <div className="space-y-4">
            <div 
              onClick={handleNavigateToSfdAccounts}
              className="border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-[#0D6A51]/10 p-2 mr-3">
                  <CreditCard className="h-5 w-5 text-[#0D6A51]" />
                </div>
                <div>
                  <h4 className="font-medium">Comptes SFD</h4>
                  <p className="text-sm text-muted-foreground">
                    {activeSfdId ? 'Gérer vos comptes SFD' : 'Ajouter votre SFD'}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground">›</div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="px-4">
          <SecuritySection />
          <NotificationsSection />
          <AdvancedSettingsSection onLogout={signOut} />
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
