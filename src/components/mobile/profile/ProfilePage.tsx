
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from './ProfileHeader';
import SfdAccountsSection from './SfdAccountsSection';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PersonalInfoSection from './PersonalInfoSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';
import ClientCodeSection from './ClientCodeSection';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const { user } = useAuth();

  return (
    <div className="pb-20">
      <ProfileHeader />

      <Tabs 
        defaultValue={activeTab} 
        className="w-full mt-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="px-4">
          <SfdAccountsSection />
        </TabsContent>
        
        <TabsContent value="security" className="px-4">
          <SecuritySection />
          <NotificationsSection />
          <AdvancedSettingsSection />
        </TabsContent>
        
        <TabsContent value="profile" className="px-4">
          <ClientCodeSection />
          <PersonalInfoSection user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
