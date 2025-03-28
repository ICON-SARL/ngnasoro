
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import ProfileHeader from './ProfileHeader';
import SfdAccountsSection from './SfdAccountsSection';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PersonalInfoSection from './PersonalInfoSection';
import KycVerificationSection from './KycVerificationSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';
import { User } from '@/hooks/auth/types';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { sfdData, activeSfdId, switchActiveSfd } = useSfdDataAccess();

  const handleGoBack = () => {
    navigate('/mobile-flow/main');
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
          <AdvancedSettingsSection onLogout={signOut} />
        </TabsContent>
        
        <TabsContent value="profile" className="px-4">
          <PersonalInfoSection user={user as User} />
          <KycVerificationSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
