import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from './ProfileHeader';
import SfdAccountsSection from './SfdAccountsSection';
import SecuritySection from './SecuritySection';
import NotificationsSection from './NotificationsSection';
import PersonalInfoSection from './PersonalInfoSection';
import AdvancedSettingsSection from './AdvancedSettingsSection';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const { user } = useAuth();

  return (
    <div className="pb-20 bg-background min-h-screen">
      <ProfileHeader />

      <Tabs 
        defaultValue={activeTab} 
        className="w-full mt-4 px-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 bg-muted/30 p-1 rounded-xl mb-4 h-10">
          <TabsTrigger 
            value="accounts"
            className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            Comptes
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            Sécurité
          </TabsTrigger>
          <TabsTrigger 
            value="profile"
            className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
          >
            Profil
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-3 mt-0">
          <SfdAccountsSection />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-3 mt-0">
          <SecuritySection />
          <NotificationsSection />
          <AdvancedSettingsSection />
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-3 mt-0">
          {user && <PersonalInfoSection user={user} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
